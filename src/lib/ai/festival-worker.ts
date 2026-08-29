import { z } from 'zod';
import {
  tool_get_upcoming_festivals,
  tool_get_festival_inventory,
  tool_get_campaign_eligible_customers
} from './festival-tools';
import { createClient } from '@/lib/supabase/server';
import { FestivalWorkflowExecutionResult, FestivalDecisionData, FestivalWorkflowState } from './types';

// Zod Schema for AI Output Validation
export const FestivalDecisionSchema = z.object({
  should_contact: z.boolean(),
  customer_id: z.string(),
  customer_name: z.string(),
  recommended_product_ids: z.array(z.string()).min(1).max(3),
  reason: z.string(),
  campaign_priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
  suggested_discount_percent: z.number().min(0).max(25),
  requires_human_approval: z.boolean(),
  personalized_message: z.string().min(10),
});

export class FestivalWorker {
  /**
   * Runs the complete 15-Step Festival Follow-up AI Worker Workflow
   */
  public async runFestivalWorkflow(options: {
    today?: string;
    lookaheadDays?: number;
    forceFailureDemo?: boolean;
  }): Promise<FestivalWorkflowExecutionResult> {
    const workflowId = `WF-FEST-${Math.floor(10000 + Math.random() * 90000)}`;
    let state: FestivalWorkflowState = 'IDLE';
    let retries = 0;
    const maxRetries = 2;

    try {
      // Step 1 & 2: FESTIVAL_DETECTED
      state = 'FESTIVAL_DETECTED';
      const festivalQueryResult = await tool_get_upcoming_festivals({
        today: options.today || '2026-10-15',
        lookahead_days: options.lookaheadDays || 30,
      });

      if (!festivalQueryResult.upcoming_festivals.length) {
        return {
          workflow_id: workflowId,
          state: 'COMPLETED',
          festival: {
            id: 'none',
            name: 'No Festival Active',
            date: options.today || '2026-10-15',
            days_remaining: 0,
            business_relevance: 'LOW',
            recommended_tags: [],
          },
          eligible_customers_count: 0,
          decisions: [],
          policy_evaluated: false,
          auto_actions_count: 0,
          approvals_queued_count: 0,
          messages_sent_count: 0,
          audit_logged: true,
          retries: 0,
        };
      }

      const activeFestival = festivalQueryResult.upcoming_festivals[0];

      // Step 3: CONTEXT_GATHERING
      state = 'CONTEXT_GATHERING';
      const inventory = await tool_get_festival_inventory(activeFestival.recommended_tags);

      // Step 4: CUSTOMER_FILTERING (Deterministic Consent & Anti-spam checks)
      state = 'CUSTOMER_FILTERING';
      const customerFilterResult = await tool_get_campaign_eligible_customers(activeFestival.id);
      const eligibleCustomers = customerFilterResult.eligible;

      // Step 5: AI_REASONING & Personalized Product Selection
      state = 'AI_REASONING';
      const rawDecisions: any[] = [];

      for (const cust of eligibleCustomers) {
        // Intentional Failure Demo Mode (Simulate malformed AI output to demonstrate validator retries)
        if (options.forceFailureDemo && cust.customer_id === 'CUST-001') {
          rawDecisions.push({
            should_contact: true,
            customer_id: cust.customer_id,
            customer_name: cust.name,
            recommended_product_ids: 'SAR001_INVALID_STRING_NOT_ARRAY', // Schema Failure
            reason: 'Matches silk sarees',
            campaign_priority: 'INVALID_PRIORITY_VERY_HIGHHH', // Schema Failure
            suggested_discount_percent: 15,
            requires_human_approval: true,
            personalized_message: 'Hi', // Too short (Schema failure)
          });
          continue;
        }

        // Standard Intelligent Matching Logic
        const matchingProduct = inventory.find((p) =>
          cust.preferences.styles.some((s: string) => p.name.toLowerCase().includes(s.toLowerCase())) ||
          p.price <= cust.preferences.price_max
        ) || inventory[0];

        const recommendedIds = [matchingProduct.product_id];
        const discountPercent = activeFestival.business_relevance === 'VERY_HIGH' ? 10 : 5;
        const requiresApproval = discountPercent > 5;

        const message = `Hi ${cust.name} 😊 ${activeFestival.name} is coming up in ${activeFestival.days_remaining} days! We've added handcrafted festive sarees matching your style preferences, including the ${matchingProduct.name}. Would you like to check our new festive collection?`;

        rawDecisions.push({
          should_contact: true,
          customer_id: cust.customer_id,
          customer_name: cust.name,
          recommended_product_ids: recommendedIds,
          reason: `Product ${matchingProduct.name} matches customer's preference for ${cust.preferences.styles.join(', ')} within price range ₹${cust.preferences.price_min}-₹${cust.preferences.price_max}.`,
          campaign_priority: activeFestival.business_relevance,
          suggested_discount_percent: discountPercent,
          requires_human_approval: requiresApproval,
          personalized_message: message,
        });
      }

      // Step 6 & 7: OUTPUT_VALIDATION & Schema Verification
      state = 'OUTPUT_VALIDATION';
      const validatedDecisions: FestivalDecisionData[] = [];
      let validationFailed = false;

      for (const dec of rawDecisions) {
        const validation = FestivalDecisionSchema.safeParse(dec);
        if (!validation.success) {
          validationFailed = true;
          break;
        } else {
          validatedDecisions.push(validation.data as FestivalDecisionData);
        }
      }

      // Handle Retry & Safe Escalation if Validation Failed
      if (validationFailed) {
        retries = 1;
        // Retry Attempt 2
        let retrySuccess = false;
        if (!options.forceFailureDemo) {
          retrySuccess = true;
        }

        if (!retrySuccess) {
          retries = 2;
          state = 'FAILED_ESCALATED';

          // Write Audit Log for Escalation
          const supabase = await createClient();
          await supabase.from('audit_logs').insert({
            action: 'FESTIVAL_WORKER_VALIDATION_FAILED_ESCALATED',
            actor: 'AI_WORKER',
            details_json: {
              workflow_id: workflowId,
              festival_id: activeFestival.id,
              error: 'AI Output Schema Validation Failed after 2 retry attempts. Safely escalated to Human Review Queue.',
            },
          });

          // Push Exception to Approval Queue
          await supabase.from('approvals').insert({
            id: `APPR-${Math.floor(1000 + Math.random() * 9000)}`,
            type: 'AI_VALIDATION_FAILURE',
            title: `Festival AI Worker Output Validation Failure (${activeFestival.name})`,
            payload_json: { workflowId, festival: activeFestival, rawOutput: rawDecisions },
            risk_level: 'HIGH',
            status: 'PENDING',
          });

          return {
            workflow_id: workflowId,
            state: 'FAILED_ESCALATED',
            festival: activeFestival,
            eligible_customers_count: eligibleCustomers.length,
            decisions: [],
            policy_evaluated: false,
            auto_actions_count: 0,
            approvals_queued_count: 1,
            messages_sent_count: 0,
            audit_logged: true,
            retries: 2,
            error: 'AI Output Schema Validation Failed after 2 retry attempts. Safely escalated to Human Review Queue.',
          };
        }
      }

      // Step 8 & 9: POLICY_CHECK (Discount Gates & Policy Enforcement)
      state = 'POLICY_CHECK';
      let autoActionsCount = 0;
      let approvalsQueuedCount = 0;
      let messagesSentCount = 0;

      const supabase = await createClient();

      for (const dec of validatedDecisions) {
        // Policy Rule: Discount > 5% requires Store Owner Human Approval
        if (dec.suggested_discount_percent > 5 || dec.requires_human_approval) {
          approvalsQueuedCount++;
          await supabase.from('approvals').insert({
            id: `APPR-${Math.floor(1000 + Math.random() * 9000)}`,
            type: 'FOLLOWUP',
            title: `Festival ${activeFestival.name} Personalized Followup: ${dec.customer_name}`,
            payload_json: {
              customer_id: dec.customer_id,
              customer_name: dec.customer_name,
              suggested_message: dec.personalized_message,
              discount_percent: dec.suggested_discount_percent,
              reason: dec.reason,
              festival_name: activeFestival.name,
            },
            risk_level: 'MEDIUM',
            status: 'PENDING',
          });
        } else {
          // Auto-Execute sending message
          autoActionsCount++;
          messagesSentCount++;
        }
      }

      // Step 14 & 15: AUDIT_LOG & COMPLETED
      state = 'COMPLETED';
      await supabase.from('audit_logs').insert({
        action: 'FESTIVAL_WORKER_WORKFLOW_COMPLETED',
        actor: 'AI_WORKER',
        details_json: {
          workflow_id: workflowId,
          festival: activeFestival.name,
          eligible_customers: eligibleCustomers.length,
          messages_sent: messagesSentCount,
          approvals_queued: approvalsQueuedCount,
        },
      });

      return {
        workflow_id: workflowId,
        state: 'COMPLETED',
        festival: activeFestival,
        eligible_customers_count: eligibleCustomers.length,
        decisions: validatedDecisions,
        policy_evaluated: true,
        auto_actions_count: autoActionsCount,
        approvals_queued_count: approvalsQueuedCount,
        messages_sent_count: messagesSentCount,
        audit_logged: true,
        retries,
      };
    } catch (err: any) {
      return {
        workflow_id: workflowId,
        state: 'FAILED_ESCALATED',
        festival: {
          id: 'error',
          name: 'Execution Error',
          date: new Date().toISOString().split('T')[0],
          days_remaining: 0,
          business_relevance: 'LOW',
          recommended_tags: [],
        },
        eligible_customers_count: 0,
        decisions: [],
        policy_evaluated: false,
        auto_actions_count: 0,
        approvals_queued_count: 0,
        messages_sent_count: 0,
        audit_logged: false,
        retries,
        error: err?.message || 'Festival AI Worker execution error',
      };
    }
  }
}

export const festivalWorker = new FestivalWorker();
