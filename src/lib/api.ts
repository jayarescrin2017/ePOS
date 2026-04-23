import { StoreSettings } from '../storeConfig';

export interface Product {
  id?: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  unit: 'pcs' | 'kg' | 'm' | 'set';
  supplier?: string;
  wholesalePrice?: number;
  purchaseDate?: string;
  purchaseQuantity?: number;
}

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  cost?: number;
  profit?: number;
}

export interface Sale {
  id?: number;
  timestamp: string;
  subtotalAmount: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  totalProfit?: number;
  paymentMethod: 'cash' | 'card';
  cashReceived?: number;
  change?: number;
  transactionReference?: string;
  items: SaleItem[];
}

export const api = {
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    return res.json();
  },
  async addProduct(product: Product): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },
  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.json();
  },
  async deleteProduct(id: number): Promise<void> {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  },
  async getSales(): Promise<Sale[]> {
    const res = await fetch('/api/sales');
    return res.json();
  },
  async addSale(sale: Sale): Promise<Sale> {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    return res.json();
  },
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch('/api/settings');
    return res.json();
  },
  async updateSettings(settings: Partial<StoreSettings>): Promise<void> {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  }
};
