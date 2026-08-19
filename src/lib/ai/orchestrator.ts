import { CatalogueWorker } from './catalogue-worker';
import { OperationsWorker } from './operations-worker';
import { CustomerWorker } from './customer-worker';
import { createClient } from '@/lib/supabase/server';

export class SareethiOrchestrator {
  public catalogueWorker = new CatalogueWorker();
  public operationsWorker = new OperationsWorker();
  public customerWorker = new CustomerWorker();

  /**
   * Executes AI Worker task with confidence check, retry handling, and Approval Queue routing
   */
  public async executeTaskWithRetries<T>(
    workerName: string,
    taskFn: () => Promise<{ confidence: number; data: T }>,
    maxRetries: number = 2
  ) {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const result = await taskFn();
        const requiresApproval = result.confidence < 0.85;

        // Write Audit Log
        const supabase = await createClient();
        await supabase.from('audit_logs').insert({
          action: `WORKER_TASK_EXECUTED`,
          actor: 'AI_WORKER',
          details_json: { workerName, confidence: result.confidence, requiresApproval },
        });

        return {
          success: true,
          confidence: result.confidence,
          data: result.data,
          requiresApproval,
          attempt,
        };
      } catch (err: any) {
        attempt++;
        if (attempt > maxRetries) {
          // Log Failure Exception & Halt
          const supabase = await createClient();
          await supabase.from('audit_logs').insert({
            action: `WORKER_TASK_FAILED`,
            actor: 'AI_WORKER',
            details_json: { workerName, error: err.message, attempts: attempt },
          });

          return {
            success: false,
            confidence: 0,
            error: err.message,
            requiresApproval: true,
            attempt,
          };
        }
      }
    }

    return { success: false, confidence: 0, requiresApproval: true, attempt: maxRetries };
  }
}

export const orchestrator = new SareethiOrchestrator();
