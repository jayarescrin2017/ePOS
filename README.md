# Professional POS PWA (Offline-First)

A high-performance Point of Sale (POS) system built with React, TypeScript, and Express. Optimized for standalone usage with local database persistence and PWA capabilities.

## 📂 Documentation

Detailed guides are available in the `docs/` folder:

*   [**User & Setup Guide**](./docs/USER_GUIDE.md): Instruction for store owners, staff management, and POS operations.
*   [**Local Installation Guide**](./docs/LOCAL_SETUP.md): Instructions for running the app on your local machine (Windows/Mac/Linux).

## 🚀 Key Features

*   **Offline-First**: Works without an internet connection using local IndexedDB.
*   **PWA**: Installable on Desktop, Android, and iOS.
*   **Inventory Level Tracking**: Automatic stock deduction and low-stock alerts.
*   **Role-Based Access**: Secure login for Admins and Cashiers.
*   **Sales Insights**: Real-time dashboard with profit tracking and sales history.
*   **Receipt Printing**: Professional thermal-style receipt generation.

## 🛠️ Built With

*   **Frontend**: React, Tailwind CSS, Lucide Icons, Framer Motion.
*   **State & DB**: Dexie.js (IndexedDB).
*   **Backend**: Node.js, Express, LowDB.
*   **Build Tool**: Vite.
