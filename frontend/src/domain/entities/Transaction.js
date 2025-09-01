class Transaction {
  constructor({
    id,
    userId,
    type,
    amount,
    status,
    description,
    referenceId,
    metadata,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.userId = userId;
    this.type = type; // 'credit' or 'debit'
    this.amount = amount;
    this.status = status || 'pending'; // 'pending', 'completed', 'failed', 'cancelled'
    this.description = description || '';
    this.referenceId = referenceId || null;
    this.metadata = metadata || {};
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  get isCredit() {
    return this.type === 'credit';
  }

  get isDebit() {
    return this.type === 'debit';
  }

  get isCompleted() {
    return this.status === 'completed';
  }

  get isPending() {
    return this.status === 'pending';
  }

  get isFailed() {
    return this.status === 'failed';
  }

  get formattedAmount() {
    const sign = this.isCredit ? '+' : '-';
    return `${sign}${this.amount.toLocaleString()}`;
  }

  get formattedDate() {
    return this.createdAt.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      amount: this.amount,
      status: this.status,
      description: this.description,
      referenceId: this.referenceId,
      metadata: this.metadata,
      formattedAmount: this.formattedAmount,
      formattedDate: this.formattedDate,
      isCredit: this.isCredit,
      isDebit: this.isDebit,
      isCompleted: this.isCompleted,
      isPending: this.isPending,
      isFailed: this.isFailed,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJSON(json) {
    return new Transaction({
      id: json.id,
      userId: json.userId,
      type: json.type,
      amount: json.amount,
      status: json.status,
      description: json.description,
      referenceId: json.referenceId,
      metadata: json.metadata,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    });
  }
}

export default Transaction;
