class CoinPackage {
  constructor({ id, name, description, coinAmount, price, isActive, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.description = description || '';
    this.coinAmount = coinAmount;
    this.price = price;
    this.isActive = isActive !== undefined ? isActive : true;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  get pricePerCoin() {
    return this.coinAmount > 0 ? this.price / this.coinAmount : 0;
  }

  get formattedPrice() {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(this.price);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      coinAmount: this.coinAmount,
      price: this.price,
      isActive: this.isActive,
      pricePerCoin: this.pricePerCoin,
      formattedPrice: this.formattedPrice,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJSON(json) {
    return new CoinPackage({
      id: json.id,
      name: json.name,
      description: json.description,
      coinAmount: json.coinAmount,
      price: json.price,
      isActive: json.isActive,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    });
  }
}

export default CoinPackage;
