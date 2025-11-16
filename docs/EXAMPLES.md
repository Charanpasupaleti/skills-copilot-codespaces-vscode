# Usage Examples

## Customer Service Example
```javascript
const response = await fetch('http://localhost:3000/api/customer-service/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId: 'cust_12345',
    query: 'I need help with my account setup.'
  })
});
```

## Sales Automation Example
```javascript
const response = await fetch('http://localhost:3000/api/sales/score-lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'prospect@company.com',
    company: 'Tech Corp',
    industry: 'Technology',
    budget: '$50,000',
    timeline: 'Q1 2024',
    engagement: 'High'
  })
});
```

## Financial Reporting Example
```javascript
const response = await fetch('http://localhost:3000/api/finance/report/monthly');
const result = await response.json();
console.log('Monthly Report:', result.report);
```

For more examples, see the main README.
