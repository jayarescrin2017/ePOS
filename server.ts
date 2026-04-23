import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.resolve(process.cwd(), 'db.json');

console.log(`Starting server with DB_FILE: ${DB_FILE}`);

// Initialize DB file if not exists
try {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: [
        { id: 1, sku: 'HD-001', name: 'Heavy Duty Hammer', category: 'Hand Tools', price: 15.99, stockQuantity: 50, minStockLevel: 5, unit: 'pcs' },
        { id: 2, sku: 'HD-002', name: 'Safety Goggles Pro', category: 'Safety', price: 9.50, stockQuantity: 100, minStockLevel: 10, unit: 'pcs' },
        { id: 3, sku: 'HD-003', name: 'Measuring Tape 5m', category: 'Hand Tools', price: 6.75, stockQuantity: 75, minStockLevel: 5, unit: 'pcs' },
        { id: 4, sku: 'HD-004', name: 'Drill Bit Set 12pc', category: 'Power Tools', price: 24.99, stockQuantity: 20, minStockLevel: 3, unit: 'set' },
        { id: 5, sku: 'HD-005', name: 'Galvanized Nails 1kg', category: 'Hardware', price: 4.50, stockQuantity: 200, minStockLevel: 20, unit: 'kg' },
      ],
      users: [
        { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator' },
        { id: 2, username: 'cashier', password: 'password123', role: 'cashier', name: 'Junior Cashier' }
      ],
      sales: [],
      settings: {
        name: "ESCRIN HOLLOWBLOCKS TRADINGS",
        address: "P5 ZILLOVIA, TALACOGON, AGUSAN DEL SUR",
        contact: "09510417587",
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log('Created initial db.json');
  }
} catch (err) {
  console.error('Failed to initialize DB:', err);
}

function readDb() {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    let changed = false;
    if (!data.settings) {
      data.settings = { 
        name: "ESCRIN HOLLOWBLOCKS TRADINGS", 
        address: "P5 ZILLOVIA, TALACOGON, AGUSAN DEL SUR", 
        contact: "09510417587" 
      };
      changed = true;
    }
    if (!data.users) {
      data.users = [
        { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator' },
        { id: 2, username: 'cashier', password: 'password123', role: 'cashier', name: 'Junior Cashier' }
      ];
      changed = true;
    }
    if (changed) {
      writeDb(data);
    }
    return data;
  } catch (err) {
    console.error('Error reading DB:', err);
    return { products: [], sales: [], settings: {}, users: [] };
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  // AI Studio requires port 3000, but we can override it via LOCAL_PORT for local setups
  const PORT = Number(process.env.LOCAL_PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Log all requests
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.get('/api/settings', (req, res) => {
    const db = readDb();
    res.json(db.settings);
  });

  app.post('/api/settings', (req, res) => {
    const db = readDb();
    db.settings = { ...db.settings, ...req.body };
    writeDb(db);
    res.json(db.settings);
  });

  app.get('/api/products', (req, res) => {
    const db = readDb();
    res.json(db.products);
  });

  // User Authentication & Management
  app.post('/api/auth/login', (req, res) => {
    const db = readDb();
    const { username, password } = req.body;
    const user = db.users.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });

  app.get('/api/users', (req, res) => {
    const db = readDb();
    const sanitizedUsers = db.users.map(({ password, ...u }: any) => u);
    res.json(sanitizedUsers);
  });

  app.post('/api/users', (req, res) => {
    const db = readDb();
    const newUser = { ...req.body, id: Date.now() };
    db.users.push(newUser);
    writeDb(db);
    const { password, ...safeUser } = newUser;
    res.json(safeUser);
  });

  app.put('/api/users/:id', (req, res) => {
    const db = readDb();
    const id = parseInt(req.params.id);
    const index = db.users.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...req.body };
      writeDb(db);
      const { password, ...safeUser } = db.users[index];
      res.json(safeUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.delete('/api/users/:id', (req, res) => {
    const db = readDb();
    const id = parseInt(req.params.id);
    db.users = db.users.filter((u: any) => u.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  app.post('/api/products', (req, res) => {
    const db = readDb();
    const newProduct = { ...req.body, id: Date.now() };
    db.products.push(newProduct);
    writeDb(db);
    res.json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const db = readDb();
    const id = parseInt(req.params.id);
    const index = db.products.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...req.body };
      writeDb(db);
      res.json(db.products[index]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    const db = readDb();
    const id = parseInt(req.params.id);
    db.products = db.products.filter((p: any) => p.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  app.get('/api/sales', (req, res) => {
    const db = readDb();
    res.json(db.sales);
  });

  app.post('/api/sales', (req, res) => {
    const db = readDb();
    const newSale = { ...req.body, id: Date.now() };
    
    // Update product stock levels
    newSale.items.forEach((item: any) => {
      const product = db.products.find((p: any) => p.id === parseInt(item.id));
      if (product) {
        product.stockQuantity -= item.quantity;
      }
    });

    db.sales.push(newSale);
    writeDb(db);
    res.json(newSale);
  });

  // Root route for API verification
  app.get('/api', (req, res) => {
    res.json({ message: 'POS API is running' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
