# Fullstack Shopping Cart Application

This repository contains a fullstack product management & shopping cart application developed as part of the **JSD Backend Assessment**. It includes an **Express.js REST API** backend with **MongoDB / Mongoose** persistence, modular routes (`express.Router()`), and a **React (Vite)** frontend that communicate seamlessly via HTTP requests.

---

## 📁 Project Structure

```text
jsd-backend-assessment/
├── client/                     # Frontend React (Vite) application
│   ├── src/
│   │   ├── App.jsx             # Main interactive application component
│   │   ├── App.css             # Component styling and layouts
│   │   ├── index.css           # Global typography and theme variables
│   │   └── main.jsx            # React root mount
│   ├── .env                    # Environment variables (VITE_API_URL)
│   ├── .env.example            # Environment variables example template
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Frontend dependencies & scripts
├── server/                     # Backend Express.js REST API
│   ├── models/
│   │   └── Product.js          # Mongoose schema & model for products
│   ├── routes/
│   │   └── products.js         # Modular routes using express.Router()
│   ├── index.js                # Express app, middlewares, database connection, and error handlers
│   ├── requests.http           # REST Client test file for all endpoints
│   ├── .env                    # Server environment variables (PORT, MONGODB_URI)
│   ├── .env.example            # Server environment variables example template
│   └── package.json            # Backend dependencies & scripts
├── my-understanding.md         # Comprehensive conceptual reflections and answers
└── README.md                   # Project setup and usage instructions
```

---

## 🚀 Quick Start Guide

Ensure you have **Node.js** (v18+ recommended) and **MongoDB** (Local or MongoDB Atlas) available.

### 1. Configure and Start the Express API Server (Backend)

Open a terminal and navigate to the `server/` directory:

```bash
cd server
npm install
```

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

Edit `server/.env` to configure your MongoDB connection:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/shopping-cart

# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/shopping-cart?retryWrites=true&w=majority
```

Start the backend server in development mode:

```bash
npm run dev
```

- The server will connect to MongoDB, automatically seed initial sample products if empty, and listen on **`http://localhost:5000`**
- Uses native `node --watch` for automatic reloads on file changes
- Includes custom request logger middleware, CORS enabled, and global error handling

### 2. Start the React Application (Frontend)

Open a **second terminal** and navigate to the `client/` directory:

```bash
cd client
npm install
npm run dev
```

- The client application will run on **`http://localhost:5173`**
- Open your browser and navigate to `http://localhost:5173` to interact with the dashboard

---

## 📡 API Endpoints Reference

The backend provides a RESTful API with the following endpoints:

| Method | Endpoint | Query Parameters | Description | Status Codes |
|---|---|---|---|---|
| `GET` | `/` | — | Health check and database status | `200 OK` |
| `GET` | `/products` | `?search=...`, `?sort=price_asc\|price_desc` | Retrieve all products (supports name filter and price sorting) | `200 OK` |
| `GET` | `/products/:id` | — | Retrieve a single product by ID | `200 OK`, `404 Not Found` |
| `POST` | `/products` | — | Create a new product (validates `name`, `price`, `quantity`) | `201 Created`, `400 Bad Request` |
| `PUT` | `/products/:id` | — | Update an existing product by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/products/:id` | — | Delete a product by ID | `200 OK`, `404 Not Found` |

### Product Data Model (MongoDB / Mongoose)

Each product item is persisted with:
- `id` (string): Unique identifier (automatically converted from MongoDB `_id` for frontend compatibility)
- `name` (string): Product title (Required, non-empty string)
- `price` (number): Non-negative numeric price (Required)
- `quantity` (number): Integer quantity (Required, defaults to `1`)
- `createdAt` / `updatedAt`: Timestamps automatically managed by Mongoose

---

## 🧪 Testing the API directly

A test file is provided in [`server/requests.http`](file:///server/requests.http). You can execute requests directly using the **REST Client** extension for VS Code or Postman.

Sample request to create a product:
```http
POST http://localhost:5000/products
Content-Type: application/json

{
  "name": "Mechanical Keyboard",
  "price": 89.99,
  "quantity": 4
}
```

---

## ✨ Features & Stretch Goals Achieved

- **Full CRUD Operations**: Create, Read, Update, and Delete products with real-time UI synchronization without browser reloads.
- **[BONUS] MongoDB Database Persistence**: Connected using Mongoose with schema validation and automatic data seeding. Supports both local MongoDB and MongoDB Atlas.
- **[BONUS] Route Modularization**: Clean architectural separation using `express.Router()` in `server/routes/products.js` and models in `server/models/Product.js`.
- **Search & Sort**: Filter items by name and sort by price using backend query parameters (`?search=`, `?sort=`).
- **Resilient UI States**: Clear visual states for initial loading, connection errors (when backend is offline), and validation errors.
- **Robust Error Handling**: Server-side input validation rejecting invalid inputs with `400 Bad Request` and descriptive error messages.
- **Centralized Configuration**: API Base URL and MongoDB URI configured via `.env` files.
