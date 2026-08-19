export type WorkerType = 'CATALOGUE_WORKER' | 'OPERATIONS_WORKER' | 'CUSTOMER_WORKER';

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
