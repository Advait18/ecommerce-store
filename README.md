# 🛒 E-Commerce Store Demo

A full-stack ecommerce application built using **Next.js**, **TypeScript**, **Tailwind CSS** and **in-memory backend logic** for simplicity. This project is tailored to demonstrate proficiency in backend development, API design, and frontend integration.


---

## 📌 Purpose of This Submission

#### This is a simulated online store where users can:
- Browse a list of example products
- Add them to a cart
- Apply discount codes (if eligible)
- Complete a checkout

>Admins can view sales stats and total revenue. All data is temporary and resets when the app restarts. This code serves to evaluate programming ability, problem-solving skills, and software design practices.

#### This project is designed to fulfill the following requirements:

- Develop API endpoints for cart and checkout functionality
- Implement discount logic that triggers every nth order
- Create admin APIs for reporting and tracking discount code usage
- Showcase optional UI integration (stretch goal)
- Demonstrate modular, testable code with in-memory state management
- Deliver clean, commented, and test-covered TypeScript code


---

## 📦 Features

- 🛍 Cart management (add, update, remove items)
- ✅ Checkout flow with optional discount code
- 🎟 Issue unique 10% discount codes every 3rd order
- 📊 Admin API for order stats and discount tracking
- 🧪 Full test coverage for services and API endpoints
- 🎨 Responsive frontend using React (Next.js)


---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally

```bash
npm run demo
```

App runs at: [http://localhost:3000](http://localhost:3000)


---

## 🧪 Running Tests

```bash
npm run test
```

> Uses **Vitest** for fast, isolated unit testing.


---

## 📚 Architecture Overview

### API Endpoints

| Endpoint                           | Method | Description                            |
|------------------------------------|--------|----------------------------------------|
| `/api/cart`                        | GET/POST/PUT/DELETE | Full cart lifecycle |
| `/api/checkout`                    | POST   | Places order, applies discount if valid |
| `/api/discount/validate`          | GET   | Validates discount code                |
| `/api/admin/stats`                | GET    | Revenue, order count, discount summary |

> All state is stored in memory for simplicity and testability.


---

## 🛠️ Services

- **CartService** – handles cart items, quantities, and totals
- **OrderService** – creates and tracks orders
- **DiscountService** – issues and validates discount codes
- **ProductService** – stores products

---

## 🧾 Discount Logic

- After every **3rd** order, the user receives a 10% discount code
- Codes can be applied during checkout and are then marked as used
- All discount handling is tracked in memory


---

## 🎨 Frontend

- Built with `Next.js`, `App Router` and `Tailwind CSS`
- `/` – product listing with “Add to Cart”
- `/cart` – full cart UI, discount code entry, and checkout
- Real-time feedback via toast notifications


---

## 🧪 Testing Highlights

- Full unit test coverage for `ProductService`, `CartService`, `OrderService`, and `DiscountService`
- API endpoint test coverage for `/api/cart`, `/api/checkout`, `/api/admin/stats`, and `/api/discount/validate`
- In-memory state resets for clean, repeatable test scenarios


---

## 📌 Assumptions

- In-memory store used for demo purposes
- Discount applies to entire cart, not individual items
- Discount code is unique per issuance and usable once
- Discount codes cannot be stacked


---

## 🛠 How the Backend Works

The backend is implemented using **Next.js API routes** and designed for modularity and in-memory operations.

### 💡 Architecture Overview

```
Client (React/Next.js UI)
      │
      ▼
 API Routes (Next.js under /app/api/)
      │
      ▼
Services (CartService, CheckoutService, OrderService, DiscountService)
      │
      ▼
 In-Memory Stores (Arrays inside service modules)
```

---

### 🔄 API Route Flow

#### 1. Cart APIs (`/api/cart`)
- `GET` – Fetch current cart state
- `POST` – Add product to cart
- `PUT` – Update quantity
- `DELETE` – Remove product

> Cart data is stored in-memory, not persisted between sessions.

#### 2. Checkout API (`/api/checkout`)
- Validates cart items
- Optionally applies a discount code
- Finalizes order via `OrderService`
- Clears cart after success
- Issues a new discount if it's the nth order

#### 3. Discount Validation (`/api/discount/validate`)
- Confirms that the discount code exists, is unused, and calculates a 10% reduction on the cart total

#### 4. Admin Stats API (`/api/admin/stats`)
- Aggregates:
  - Total orders
  - Total revenue
  - Total discount amount
  - List of discount codes (used/unused)
  - Prediction of when the next discount will be issued

---
# 📘 API Documentation
## 🛍️ `/api/cart`

### Description:
Manages the user's shopping cart. Supports full CRUD (Create, Read, Update, Delete) operations.

### Connected Systems:
- Frontend cart UI
- Order placement service

### Methods:

#### `GET`
Retrieve the current user's cart contents.

**Response:**
```json
{
  "items": [
    {
      "productId": string,
      "name": string,
      "price": number,
      "quantity": number
    }
  ], 
  "total": number
}
```

#### `POST`
Add a product to the user's cart.

**Request Body:**
```json
{
  "productId": string,
  "quantity": number
}
```

**Response:**
```json
{
  "items":[
      {
            "productId": string,
            "quantity": number,
            "product": {
                "id": number,
                "name": string,
                "price": number,
                "description": string
            }
      }
  ],
  "total": number
}
```

#### `PUT`
Update the quantity of an item in the cart.

**Request Body:**
```json
{
  "productId": string,
  "quantity": number
}
```

**Response:**
```json
{
  "items":[
      {
            "productId": string,
            "quantity": number,
            "product": {
                "id": number,
                "name": string,
                "price": number,
                "description": string
            }
      }
  ],
  "total": number
}
```

#### `DELETE`
Remove an item from the cart.

**Request Params:**
```url
/api/cart/:productId
```

**Response:**
```json
{
    "items":[
      {
            "productId": string,
            "quantity": number,
            "product": {
                "id": number,
                "name": string,
                "price": number,
                "description": string
            }
      }
  ],
  "total": number
}
```

---

## 💳 `/api/checkout`

### Description:
Handles the checkout process. Finalizes the cart into an order, with optional discount code application.

### Connected Systems:
- Order service
- Discount service

### Methods:

#### `POST`
Initiates a checkout with the current cart and optional discount.

**Request Body:**
```json
{
  "discountCode": string
}
```

**Response:**
```json
{
      "orderId": string,
      "finalAmount": number,
      "discountApplied": boolean,
      "discountAmount": number,
      "newDiscountCode": string
}
```

---

## 🎟️ `/api/discount/validate`

### Description:
Validates a discount code before it can be applied at checkout.

### Connected Systems:
- Checkout API
- Admin discount generator

### Methods:

#### `POST`
Check validity of a discount code.

**Request Body:**
```json
{
  "code": string,
  "cartTotal": number
}
```

**Response:**
```json
{
  "code": string,
  "amout": number,
  "percentage": number
}
```

---

## 🔐 `/api/admin/generate-discount`

### Description:
Automatically generates a discount code when the `nth` order condition is met.

### Connected Systems:
- Order tracking
- Discount validation

### Methods:

#### `GET`
Generate a discount code.

**Response:**
```json
{
  "code": string,
  "message": string
}
```

---

## 📊 `/api/admin/stats`

### Description:
Provides store analytics like total items sold, revenue, discounts applied, etc.

### Connected Systems:
- Admin dashboard
- Reporting tools

### Methods:

#### `GET`
Fetch store-wide metrics.

**Response:**
```json
{
    "totalItemsPurchased": number,
    "totalPurchaseAmount": number,
    "discountCodes": [
        {
            "code": string,
            "isUsed": boolean,
            "createdAt": string,
            "usedAt": string
        }
    ],
    "totalDiscountAmount": number,
    "totalOrders": number,
    "nextDiscountOrderNumber": number
}

```

---

## 🔐 `/api/auth/[...nextauth]`

### Description:
Manages authentication using NextAuth.js.

### Connected Systems:
- Entire frontend (login/logout/session)
- User session management

### Methods:
- `GET/POST` (handled internally by NextAuth)

---

## 🔧 `/api/auth/[...nextauth]/options`

### Description:
Internal endpoint exposing NextAuth options.

### Methods:
- Used internally by NextAuth for configuration

---

## 🧠 Assumptions

- APIs assume in-memory data; persistence is not required.
- Discount codes are generated on every `nth` order and are one-time use.
- Discounts apply to the entire cart, not individual items.

---

## 📂 Folder Structure

- `app/api/`: API route logic
- `lib/services/`: Core business logic
- `components/`: UI components (if implemented)
- `hooks/`: Custom client-side hooks
- `public/`: Static assets
- `lib/api-tests/`, `lib/services/tests/`: Unit and integration tests

---
## 🧠 Service Details

### 🛒 CartService
- Stores items in a flat array
- Each item has a reference to its product metadata
- Totals are computed dynamically

### 📦 OrderService
- Orders are assigned sequential IDs (`ORD-0001`, etc.)
- Stores subtotal, discount, and final amount
- Exposes analytics functions (total revenue, discounts used, etc.)

### 🎁 DiscountService
- Every Nth order (e.g. 3rd, 6th...) triggers a new discount code generation
- Discount codes are one-time use
- State managed in-memory via an array

---

## 🏁 Final Notes

This project demonstrates:
- Clean TypeScript and Next.js integration
- Test-driven backend development
- UI + API cohesion
- Problem-solving under realistic constraints
