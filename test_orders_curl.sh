#!/bin/bash

echo "🧪 Testing Order Service API Endpoints"
echo "======================================"

# Configuration
BASE_URL="http://localhost:3000"
USER_TOKEN="your_jwt_token_here"  # Replace with actual JWT token
TEST_USER_ID="a9ed8c62-3262-49ed-a211-676394f55872"
TEST_ORDER_ID="2368c772-ce54-4022-b68a-145dce0bb342"
TEST_PROJECT_ID="e9beac16-7b2c-46a4-b022-23d48c15f73e"

echo ""
echo "1️⃣ Testing GET /api/orders (getUserOrders)"
echo "----------------------------------------"
curl -X GET \
  "${BASE_URL}/api/orders" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response (raw):"

echo ""
echo "2️⃣ Testing GET /api/orders/:id (getOrderById)"
echo "-------------------------------------------"
curl -X GET \
  "${BASE_URL}/api/orders/${TEST_ORDER_ID}" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response (raw):"

echo ""
echo "3️⃣ Testing GET /api/orders with project filter"
echo "--------------------------------------------"
curl -X GET \
  "${BASE_URL}/api/orders?project_id=${TEST_PROJECT_ID}" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response (raw):"

echo ""
echo "4️⃣ Testing GET /api/orders with status filter"
echo "-------------------------------------------"
curl -X GET \
  "${BASE_URL}/api/orders?status=pending,confirmed" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response (raw):"

echo ""
echo "🏁 Test completed!"
echo ""
echo "📝 To use this script:"
echo "   1. Make sure your backend server is running on port 3000"
echo "   2. Replace USER_TOKEN with a valid JWT token"
echo "   3. Run: chmod +x test_orders_curl.sh && ./test_orders_curl.sh"