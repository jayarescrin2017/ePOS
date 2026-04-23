import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'db.json');

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    products: [
      { id: 1, sku: 'HD-001', name: 'Heavy Duty Hammer', category: 'Hand Tools', price: 15.99, stockQuantity: 50, unit: 'pcs' },
      { id: 2, sku: 'HD-002', name: 'Safety Goggles Pro', category: 'Safety', price: 9.50, stockQuantity: 100, unit: 'pcs' },
      { id: 3, sku: 'HD-003', name: 'Measuring Tape 5m', category: 'Hand Tools', price: 6.75, stockQuantity: 75, unit: 'pcs' },
      { id: 4, sku: 'HD-004', name: 'Drill Bit Set 12pc', category: 'Power Tools', price: 24.99, stockQuantity: 20, unit: 'set' },
      { id: 5, sku: 'HD-005', name: 'Galvanized Nails 1kg', category: 'Hardware', price: 4.50, stockQuantity: 200, unit: 'kg' },
    ],
    sales: [],
    settings: {
      name: "ACE HARDWARE PRO",
      address: "123 Industrial Ave, Tech City",
      contact: "(555) 012-3456",
    }
  };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

function readDb() {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  if (!data.settings) {
    data.settings = { name: "ESCRIN HOLLOWBLOCKS TRADINGS", address: "P5 ZILLOVIA, TALACOGON, AGUSAN DEL SUR", contact: "09510417587" };
    writeDb(data);
  }
  return data;
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
