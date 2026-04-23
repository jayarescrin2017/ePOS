import { StoreSettings } from '../storeConfig';
import { db } from './db';

export interface Product {
  id?: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  minStockLevel: number; // Added for alerts
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
  operatorName: string; // Track who made the sale
  operatorRole: 'admin' | 'cashier'; // Track role at time of sale
  items: SaleItem[];
}

export interface User {
  id?: number;
  username: string;
  password?: string;
  role: 'admin' | 'cashier';
  name: string;
}

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error (${res.status}): ${errorText || res.statusText}`);
  }
  return res.json();
};

export const api = {
  async login(username: string, password: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const user = await handleResponse(res);
    // Cache user locally for offline role checks (optional, but good for persistence)
    await db.users.put(user);
    return user;
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      const users = await handleResponse(res);
      await db.users.clear();
      await db.users.bulkAdd(users);
      return users;
    } catch (error) {
      return db.users.toArray();
    }
  },

  async addUser(user: User): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const saved = await handleResponse(res);
    await db.users.put(saved);
    return saved;
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const updated = await handleResponse(res);
    await db.users.put(updated);
    return updated;
  },

  async deleteUser(id: number): Promise<void> {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    await db.users.delete(id);
  },

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      const products = await handleResponse(res);
      // Sync local DB
      await db.products.clear();
      await db.products.bulkAdd(products);
      return products;
    } catch (error) {
      console.warn('Server unreachable, using local database for products.');
      return db.products.toArray();
    }
  },

  async addProduct(product: Product): Promise<Product> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const saved = await handleResponse(res);
      await db.products.put(saved);
      return saved;
    } catch (error) {
      console.warn('Server unreachable, saving product locally.');
      const localId = await db.products.add({ ...product, isUnsynced: true });
      return { ...product, id: localId as number };
    }
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const updated = await handleResponse(res);
      await db.products.put(updated);
      return updated;
    } catch (error) {
      console.warn('Server unreachable, updating product locally.');
      const existing = await db.products.get(id);
      const updated = { ...existing, ...product, isUnsynced: true } as Product;
      await db.products.put(updated);
      return updated;
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
      await db.products.delete(id);
    } catch (error) {
      console.warn('Server unreachable, deleting product locally.');
      await db.products.delete(id);
    }
  },

  async getSales(): Promise<Sale[]> {
    try {
      const res = await fetch('/api/sales');
      const sales = await handleResponse(res);
      // Sync local
      await db.sales.clear();
      await db.sales.bulkAdd(sales);
      return sales;
    } catch (error) {
      console.warn('Server unreachable, using local database for sales.');
      return db.sales.orderBy('timestamp').reverse().toArray();
    }
  },

  async addSale(sale: Sale): Promise<Sale> {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      });
      const saved = await handleResponse(res);
      await db.sales.put(saved);
      return saved;
    } catch (error) {
      console.warn('Server unreachable, saving sale locally.');
      // Update local product stock
      for (const item of sale.items) {
        const product = await db.products.get(Number(item.id));
        if (product) {
          await db.products.update(product.id!, { stockQuantity: product.stockQuantity - item.quantity });
        }
      }
      const localId = await db.sales.add({ ...sale, isUnsynced: true });
      return { ...sale, id: localId as number };
    }
  },

  async getSettings(): Promise<StoreSettings> {
    try {
      const res = await fetch('/api/settings');
      const settings = await handleResponse(res);
      await db.settings.put({ ...settings, name: 'current' });
      return settings;
    } catch (error) {
      const local = await db.settings.get('current');
      return local || { name: 'Escrin HollowBlocks', address: '', contact: '', taxRate: 0.12 };
    }
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<void> {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const current = await this.getSettings();
      await db.settings.put({ ...current, ...settings, name: 'current' });
    } catch (error) {
       await db.settings.put({ ...settings, name: 'current', isUnsynced: true } as any);
    }
  },

  async syncOfflineData() {
    // Sync unsynced product additions/updates
    const unsyncedProducts = await db.products.where('isUnsynced').equals(1).toArray();
    for (const p of unsyncedProducts) {
      try {
        const { isUnsynced, ...data } = p as any;
        if (p.id && p.id > 1000000000000) { // Temporary ID
          delete (data as any).id;
          await this.addProduct(data);
        } else {
          await this.updateProduct(p.id!, data);
        }
        await db.products.update(p.id!, { isUnsynced: false });
      } catch (e) {
        console.error('Failed to sync product:', p.name);
      }
    }

    // Sync unsynced sales
    const unsyncedSales = await db.sales.where('isUnsynced').equals(1).toArray();
    for (const s of unsyncedSales) {
      try {
        const { isUnsynced, id, ...data } = s as any;
        await this.addSale(data);
        await db.sales.delete(id); // Delete the local one, getSales will bring it back from server
      } catch (e) {
        console.error('Failed to sync sale:', s.timestamp);
      }
    }
  }
};

