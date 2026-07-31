/**
 * Ledger Production API Smoke Test Script
 * Verifies all layered endpoints (Auth, Expenses, Categories, Dashboard, Analytics).
 * Run via: node src/server/tests/verify-api.js
 */

const http = require("http");

const BASE_URL = "http://localhost:3000"; // Target Next.js Route Handler port
let sessionCookie = "";

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (sessionCookie) {
      options.headers["Cookie"] = sessionCookie;
    }

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        // Capture session cookie from response headers
        const setCookieHeaders = res.headers["set-cookie"];
        if (setCookieHeaders) {
          const cookie = setCookieHeaders.find((c) => c.startsWith("ledger_session="));
          if (cookie) {
            sessionCookie = cookie.split(";")[0];
          }
        }

        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("⚡ Starting Ledger API Integration Smoke Tests...");

  try {
    const testEmail = `test_${Date.now()}@ledger.dev`;

    // 1. Test User Registration
    console.log("\n➡️  1. Testing User Registration...");
    const regRes = await request("POST", "/api/auth/register", {
      name: "Verification User",
      email: testEmail,
      password: "testpassword123",
      currency: "INR",
    });
    console.log(`Status: ${regRes.status} | Success: ${regRes.data?.success || false} | Message: ${regRes.data?.message || "None"}`);
    if (regRes.status !== 201) throw new Error(`Registration failed: ${regRes.data?.message || "Unknown error"}`);

    // 2. Test User Login
    console.log("\n➡️  2. Testing User Login...");
    const loginRes = await request("POST", "/api/auth/login", {
      email: testEmail,
      password: "testpassword123",
    });
    console.log(`Status: ${loginRes.status} | Cookie captured: ${Boolean(sessionCookie)}`);
    if (loginRes.status !== 200) throw new Error("Login failed");

    // 3. Test Session Endpoint
    console.log("\n➡️  3. Testing Active Session retrieval...");
    const sessionRes = await request("GET", "/api/auth/session");
    console.log(`Status: ${sessionRes.status} | Authenticated Email: ${sessionRes.data.data?.user?.email}`);
    if (sessionRes.status !== 200) throw new Error("Session fetch failed");

    // 4. Test Create Category
    console.log("\n➡️  4. Testing Create Category...");
    const catRes = await request("POST", "/api/categories", {
      name: "Entertainment",
      color: "#8B5CF6",
      icon: "film",
    });
    console.log(`Status: ${catRes.status} | Created Name: ${catRes.data.data?.name}`);
    if (catRes.status !== 201) throw new Error("Category creation failed");
    const categoryId = catRes.data.data?.id;

    // 5. Test Create Expense
    console.log("\n➡️  5. Testing Create Expense transaction...");
    const expenseRes = await request("POST", "/api/expenses", {
      title: "Movie Tickets & Drinks",
      amount: 450.0,
      expenseDate: new Date().toISOString(),
      paymentMethod: "UPI",
      categoryId: categoryId,
      notes: "Cinepolis VIP show with friends",
    });
    console.log(`Status: ${expenseRes.status} | Created Title: ${expenseRes.data.data?.title}`);
    if (expenseRes.status !== 201) throw new Error("Expense creation failed");
    const expenseId = expenseRes.data.data?.id;

    // 6. Test Fetch Expense List
    console.log("\n➡️  6. Testing Filtered Expense List query...");
    const listRes = await request("GET", `/api/expenses?categoryId=${categoryId}&limit=5`);
    console.log(`Status: ${listRes.status} | Found: ${listRes.data.data?.length} transactions`);
    if (listRes.status !== 200) throw new Error("Expense listing failed");

    // 7. Test Dashboard Metrics
    console.log("\n➡️  7. Testing Dashboard Stats aggregate...");
    const dashRes = await request("GET", "/api/dashboard");
    console.log(`Status: ${dashRes.status} | Total Expenses: ₹${dashRes.data.data?.totalExpenses}`);
    if (dashRes.status !== 200) throw new Error("Dashboard fetch failed");

    // 8. Test Analytics Breakdown
    console.log("\n➡️  8. Testing Financial Analytics breakdown...");
    const analyticsRes = await request("GET", "/api/analytics");
    console.log(`Status: ${analyticsRes.status} | Average Daily Spend: ₹${analyticsRes.data.data?.averageDailySpending}`);
    if (analyticsRes.status !== 200) throw new Error("Analytics fetch failed");

    // 9. Test Delete Expense (Cleanup)
    console.log("\n➡️  9. Performing Database Cleanup (Delete Expense)...");
    const delRes = await request("DELETE", `/api/expenses/${expenseId}`);
    console.log(`Status: ${delRes.status} | Success: ${delRes.data.success}`);
    if (delRes.status !== 200) throw new Error("Expense deletion cleanup failed");

    console.log("\n🎉 ALL SMOKE TESTS COMPLETED SUCCESSFULLY!");
  } catch (error) {
    console.error(`\n❌ Smoke test failed: ${error.message}`);
    process.exit(1);
  }
}

runTests();
