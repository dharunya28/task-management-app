/**
 * Verification Test Suite for Task Management Application
 */
const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const http = require("http");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const authRoutes = require("../backend/routes/auth");
const taskRoutes = require("../backend/routes/taskRoutes");
const User = require("../backend/models/user");
const Task = require("../backend/models/Task");

const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function runTests() {
    console.log("=================================================");
    console.log("🧪 STARTING TASK MANAGEMENT APP VERIFICATION TESTS");
    console.log("=================================================");

    if (!mongoURI) {
        console.error("❌ MONGODB_URI (or MONGO_URI) is not defined in backend/.env");
        process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB for test suite");

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get("/api/health", (req, res) => {
        res.status(200).json({ status: "ok", message: "Task Management API is healthy" });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/tasks", taskRoutes);

    const clientDist = fs.existsSync(path.join(__dirname, "../docs"))
        ? path.join(__dirname, "../docs")
        : path.join(__dirname, "../frontend/dist");

    if (fs.existsSync(clientDist)) {
        app.use(express.static(clientDist));
        app.use((req, res, next) => {
            if (req.method === "GET" && !req.path.startsWith("/api")) {
                return res.sendFile(path.join(clientDist, "index.html"));
            }
            next();
        });
    }

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;
    console.log(`✅ Test server running on ${baseUrl}\n`);

    let passed = 0;
    let failed = 0;

    const assert = (condition, desc) => {
        if (condition) {
            console.log(`  ✅ PASS: ${desc}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${desc}`);
            failed++;
        }
    };

    const timestamp = Date.now();
    const testUser = {
        name: `Test User ${timestamp}`,
        email: `taskuser_${timestamp}@test.edu`,
        password: "SecurePassword123!"
    };

    let authToken = null;
    let createdTaskId = null;

    try {
        // 1. Health check
        console.log("1. Health Endpoint");
        const resHealth = await fetch(`${baseUrl}/api/health`);
        const jsonHealth = await resHealth.json();
        assert(resHealth.status === 200 && jsonHealth.status === "ok", "GET /api/health returns 200 OK");

        // 2. User registration
        console.log("\n2. User Registration");
        const resReg = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser)
        });
        const jsonReg = await resReg.json();
        assert(resReg.status === 201 && !!jsonReg.token, "POST /api/auth/register creates user and returns JWT token");
        authToken = jsonReg.token;

        // 3. Duplicate registration prevention
        console.log("\n3. Duplicate Registration Prevention");
        const resDup = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser)
        });
        assert(resDup.status === 400, "Duplicate registration rejected with 400 Bad Request");

        // 4. User login
        console.log("\n4. User Login");
        const resLogin = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });
        const jsonLogin = await resLogin.json();
        assert(resLogin.status === 200 && !!jsonLogin.token, "POST /api/auth/login succeeds and returns JWT token");

        // 5. Protected profile route (/api/auth/me)
        console.log("\n5. Protected Profile Verification");
        const resMe = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const jsonMe = await resMe.json();
        assert(resMe.status === 200 && jsonMe.email === testUser.email.toLowerCase(), "GET /api/auth/me returns authenticated user details");

        // 6. Create Task
        console.log("\n6. Create Task");
        const resTaskCreate = await fetch(`${baseUrl}/api/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: "Complete Semester Project",
                description: "Finalize presentation slides and demo",
                priority: "High",
                status: "Todo"
            })
        });
        const jsonTaskCreate = await resTaskCreate.json();
        assert(resTaskCreate.status === 201 && jsonTaskCreate.title === "Complete Semester Project", "POST /api/tasks creates task");
        createdTaskId = jsonTaskCreate._id;

        // 7. Get Tasks
        console.log("\n7. Fetch All User Tasks");
        const resTaskList = await fetch(`${baseUrl}/api/tasks`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const jsonTaskList = await resTaskList.json();
        assert(
            resTaskList.status === 200 &&
            Array.isArray(jsonTaskList) &&
            jsonTaskList.some(t => t._id === createdTaskId),
            "GET /api/tasks returns task list containing created task"
        );

        // 8. Update Task
        console.log("\n8. Update Task Status");
        const resTaskUpdate = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({
                status: "Completed"
            })
        });
        const jsonTaskUpdate = await resTaskUpdate.json();
        assert(resTaskUpdate.status === 200 && jsonTaskUpdate.status === "Completed", "PUT /api/tasks/:id updates task status to Completed");

        // 9. Delete Task
        console.log("\n9. Delete Task");
        const resTaskDel = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` }
        });
        assert(resTaskDel.status === 200, "DELETE /api/tasks/:id deletes task");
        createdTaskId = null;

        // 10. Frontend static delivery
        console.log("\n10. Client Production Build Delivery");
        const resHome = await fetch(`${baseUrl}/`);
        const homeHtml = await resHome.text();
        assert(resHome.status === 200 && homeHtml.includes("<html"), "GET / serves the built React index.html");

    } finally {
        console.log("\n🧹 Cleaning up test artifacts from database...");
        if (createdTaskId) {
            await Task.findByIdAndDelete(createdTaskId);
        }
        await User.deleteOne({ email: testUser.email.toLowerCase() });
        console.log("Cleaned up test user and test tasks.");

        await new Promise((resolve) => server.close(resolve));
        await mongoose.disconnect();
        console.log("Disconnected test server and database.");
    }

    console.log("\n=================================================");
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch((err) => {
    console.error("Test execution threw error:", err);
    process.exit(1);
});
