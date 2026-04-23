#!/bin/bash

echo "==================================================="
echo "    Local POS System Setup and Runner (Mac/Linux)  "
echo "==================================================="
echo ""

# Check for Node.js
if ! command -v npm &> /dev/null
then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/ before running this script."
    exit 1
fi

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "[INFO] First time setup: Installing dependencies..."
    echo "This might take a minute or two..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies. Check your internet connection."
        exit 1
    fi
    echo "[SUCCESS] Dependencies installed successfully!"
    echo ""
else
    echo "[INFO] Dependencies found."
fi

# Start the application
echo "[INFO] Starting the local server on port 8080..."
echo "Go to http://localhost:8080 in your web browser once you see 'Server running'"
echo ""
export LOCAL_PORT=8080
npm run dev
