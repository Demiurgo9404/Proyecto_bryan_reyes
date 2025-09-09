// Factura de suscripción
export interface SubscriptionInvoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  paidAt?: Date;
  dueDate: Date;
  invoiceUrl?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transacción de suscripción
export interface SubscriptionTransaction {
  id: string;
  type: 'subscription' | 'one_time' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'disputed';
  description: string;
  referenceId?: string;
  paymentMethod: string;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Historial de pausas de suscripción
export interface SubscriptionPauseHistory {
  id: string;
  startDate: Date;
  endDate?: Date;
  reason?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Estado de la suscripción del modelo
export interface ModelSubscription {
  isSubscribed: boolean;
  subscriptionPrice?: number;
  subscriptionRenewalDate?: Date;
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'none';
  subscriptionTier?: string;
  subscriptionBenefits?: string[];
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  subscriptionAutoRenew: boolean;
  subscriptionCancelledAt?: Date;
  subscriptionPausedUntil?: Date;
  subscriptionPauseReason?: string;
  subscriptionPauseCount: number;
  subscriptionPauseLimit: number;
  subscriptionPauseRemaining: number;
  subscriptionPauseExpiresAt?: Date;
  subscriptionPauseHistory: SubscriptionPauseHistory[];
  subscriptionInvoices: SubscriptionInvoice[];
  subscriptionTransactions: SubscriptionTransaction[];
  subscriptionNotes?: string;
  subscriptionCustomFields?: Record<string, any>;
  subscriptionMetadata?: Record<string, any>;
}
