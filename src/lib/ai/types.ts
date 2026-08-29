export type WorkerType = 'CATALOGUE_WORKER' | 'OPERATIONS_WORKER' | 'CUSTOMER_WORKER' | 'FESTIVAL_WORKER';

export interface WorkerTaskResult<T = unknown> {
  taskId: string;
  workerType: WorkerType;
  success: boolean;
  confidence: number;
  data?: T;
  error?: string;
  retryCount: number;
  requiresApproval: boolean;
}

export interface StructuredCatalogueExtraction {
  suggestedSku: string;
  name: string;
  category: 'Saree' | 'Suit' | 'Other';
  extractedPrice?: number;
  fallbackPriceUsed: boolean;
  finalPrice: number;
  attributes: {
    color?: string;
    fabric?: string;
    style?: string;
    occasion?: string;
    blouse?: string;
  };
  confidence: number;
}

export interface StructuredOrderException {
  orderId: string;
  customerName: string;
  delayHours: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedAction: string;
  draftCustomerMessage: string;
}

export interface StructuredCustomerFollowup {
  customerId: string;
  customerName: string;
  daysSinceLastPurchase: number;
  avgIntervalDays: number;
  suggestedMessage: string;
  evidence: string;
}

export type FestivalWorkflowState =
  | 'IDLE'
  | 'FESTIVAL_DETECTED'
  | 'CONTEXT_GATHERING'
  | 'CUSTOMER_FILTERING'
  | 'AI_REASONING'
  | 'OUTPUT_VALIDATION'
  | 'POLICY_CHECK'
  | 'AUTO_EXECUTE'
  | 'HUMAN_APPROVAL'
  | 'SEND'
  | 'AUDIT_LOG'
  | 'COMPLETED'
  | 'FAILED_ESCALATED';

export interface FestivalEventData {
  id: string;
  name: string;
  date: string;
  days_remaining: number;
  business_relevance: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_tags: string[];
  campaign_group?: string;
}

export interface FestivalDecisionData {
  should_contact: boolean;
  customer_id: string;
  customer_name: string;
  recommended_product_ids: string[];
  recommended_products_summary?: string[];
  reason: string;
  campaign_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  suggested_discount_percent: number;
  requires_human_approval: boolean;
  personalized_message: string;
}

export interface FestivalWorkflowExecutionResult {
  workflow_id: string;
  state: FestivalWorkflowState;
  festival: FestivalEventData;
  eligible_customers_count: number;
  decisions: FestivalDecisionData[];
  policy_evaluated: boolean;
  auto_actions_count: number;
  approvals_queued_count: number;
  messages_sent_count: number;
  audit_logged: boolean;
  retries: number;
  error?: string;
}

