import Dexie, { type Table } from 'dexie';
import { Product, Sale, User } from './api';
import { StoreSettings } from '../storeConfig';

export class PosDatabase extends Dexie {
  products!: Table<Product & { isUnsynced?: boolean }>;
  sales!: Table<Sale & { isUnsynced?: boolean }>;
  settings!: Table<StoreSettings & { isUnsynced?: boolean }>;
  users!: Table<User>;

  constructor() {
    super('PosDatabase');
    this.version(1).stores({
      products: '++id, sku, name, category, isUnsynced',
      sales: '++id, timestamp, totalAmount, isUnsynced',
      settings: 'name, isUnsynced',
      users: '++id, username, role'
    });
  }
}

export const db = new PosDatabase();
