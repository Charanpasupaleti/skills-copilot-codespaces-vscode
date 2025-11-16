# API Documentation

## Overview
This document provides detailed information about the AI Business Automation System API endpoints.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API doesn't require authentication. For production use, implement OAuth2 or API key authentication.

---

## Customer Service API

### Handle Customer Query
Process and respond to customer inquiries using AI.

**Endpoint:** `POST /api/customer-service/query`

**Request Body:**
```json
{
  "customerId": "string (required)",
  "query": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI-generated response to the customer query"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/customer-service/query \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_123",
    "query": "How do I reset my password?"
  }'
```

---

## Document Processing API

### Process Document
Extract information and process various document types.

**Endpoint:** `POST /api/documents/process`

**Request Body:**
```json
{
  "type": "invoice|contract|general",
  "content": "string (document text)"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "extractedData": {},
    "validation": {},
    "processedAt": "ISO timestamp"
  }
}
```

---

## Sales Automation API

### Score Lead
Analyze and score a lead based on conversion potential.

**Endpoint:** `POST /api/sales/score-lead`

**Request Body:**
```json
{
  "email": "string (required)",
  "company": "string",
  "industry": "string",
  "budget": "string",
  "timeline": "string",
  "engagement": "string"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "score": 85,
    "analysis": "Detailed AI analysis"
  }
}
```

---

## Inventory Management API

### Add Inventory Item
**Endpoint:** `POST /api/inventory/add`

### Update Item Quantity
**Endpoint:** `PUT /api/inventory/:sku/quantity`

### Get Low Stock Items
**Endpoint:** `GET /api/inventory/low-stock`

---

## Financial Reporting API

### Record Transaction
**Endpoint:** `POST /api/finance/transaction`

### Generate Financial Report
**Endpoint:** `GET /api/finance/report/:period`

### Analyze Cash Flow
**Endpoint:** `GET /api/finance/cashflow?months=3`

---

## Workflow API

### List Workflows
**Endpoint:** `GET /api/workflows`

### Execute Workflow
**Endpoint:** `POST /api/workflows/:name/execute`

For complete documentation, see the source code.
