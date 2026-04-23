# POS System - User & Setup Guide

Welcome to your new Point of Sale (POS) System. This application is designed to be a high-performance, offline-first Progressive Web App (PWA) tailored for retail and trading businesses.

---

## 🚀 Quick Start / Installation

This app is a **PWA (Progressive Web App)**, meaning it works like a native desktop or mobile application without needing a traditional installer.

### Desktop Installation (Chrome/Edge)
1. Open the application URL in your browser.
2. Look for the **"Install POS"** button in the top header (or the install icon in the address bar).
3. Click **Install**.
4. The app will now appear on your desktop/start menu and can be launched even without an internet connection.

---

## 🔐 First Time Login

The system comes pre-configured with two user roles. Use these credentials for your first login:

*   **Administrator Account**
    *   **Username:** `admin`
    *   **Password:** `admin123`
    *   *Permissions:* Full access to Settings, Reports, Inventory, and Staff management.

*   **Cashier Account**
    *   **Username:** `cashier`
    *   **Password:** `password123`
    *   *Permissions:* Access to Sales (POS) and Sales History only.

---

## ⚙️ Initial Configuration

Before you start selling, you should configure your store details:

1.  **Login as Admin**.
2.  Go to the **Store** section (Building icon).
3.  **General Settings**:
    *   Update your **Store Name**, **Address**, and **Contact Number**.
    *   **Upload Logo**: This logo will appear on the receipt and dashboard.
    *   **Receipt Footer**: Add a custom message like "Thank you for shopping!"
4.  **Staff Management**:
    *   Change the default `admin` and `cashier` passwords for security.
    *   Add your actual staff members and assign them roles.

---

## 📦 Inventory Management

To track stock correctly, you must populate your catalog:

1.  Go to **Inventory** (Package icon).
2.  Click **New Product (F9)**.
3.  **Identity**: Enter SKU/Barcode and a clear Description.
4.  **Pricing**: Enter your **Wholesale Cost** and **Retail Price**. The system will automatically calculate your profit margin.
5.  **Stock Levels**: Enter current quantity and an **Alert Level**. When stock drops below this level, the item will highlight as "Low Stock".

---

## 💰 Making Sales (POS)

The POS is optimized for speed and works offline.

*   **Search**: Use the search bar (Alt + S) to find items by SKU or Name.
*   **Discounts**: You can apply a flat discount to any item in the cart.
*   **Checkout**:
    *   **Cash**: Enter the amount received to calculate change.
    *   **GCash/Card**: Enter the transaction reference for your records.
*   **Receipts**: After finalizing, you can print a professional receipt or save it as PDF.

---

## 📊 Reports & History

*   **Sales History**: View every transaction made. You can search by receipt ID or filter by date.
*   **Ledger Export**: Download your entire transaction log as a CSV (Excel) file for accounting.
*   **Reports Dashboard**: Access visual insights into your Profit/Loss, Peak Sales Times, and Best Selling products.

---

## 📶 Offline Usage & Syncing

*   **Offline Mode**: You can continue to make sales even if your internet goes down. Data is stored securely in your browser's local database.
*   **Sync Data**: When you are back online, look for the **"Sync Data"** button in the header. Clicking this will upload your offline transactions to the central server to ensure your reports are up to date.

---

## ⌨️ Keyboard Shortcuts

Speed up your workflow using these shortcuts:
*   `Alt + 1`: Dashboard
*   `Alt + 2`: POS (Point of Sale)
*   `Alt + 3`: Inventory
*   `Alt + 4`: Sales History
*   `Alt + 5`: Reports
*   `Alt + 6`: Store Settings
*   `F9` or `Alt + N`: New Product (in Inventory)
*   `Alt + S`: Focus Search (in POS/Inventory)
*   `Alt + C`: Select Cash Payment
*   `Alt + K`: Select Card/GCash Payment
*   `Alt + V`: Void/Clear Cart
