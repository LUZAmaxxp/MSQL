import bcrypt from "bcryptjs";
import { sql } from "./config/database.js";
import dotenv from "dotenv";

dotenv.config();

// Script to create or update admin user
async function manageAdminUser() {
  try {
    await sql.connect();
    console.log("✅ Connected to database");

    // Check if admin user exists
    const adminEmail = "admin@hotel.com"; // Change this to your admin email
    const adminPassword = "admin123"; // Change this to your desired admin password

    console.log("\n🔍 Checking for existing admin user...");

    const checkQuery = `
      SELECT id, email, role, password, is_active 
      FROM users 
      WHERE email = @email
    `;

    const checkRequest = sql.request();
    checkRequest.input("email", sql.VarChar, adminEmail);
    const existingUser = await checkRequest.query(checkQuery);

    if (existingUser.recordset.length > 0) {
      const user = existingUser.recordset[0];
      console.log("👤 Admin user found:");
      console.log("   - ID:", user.id);
      console.log("   - Email:", user.email);
      console.log("   - Role:", user.role);
      console.log("   - Active:", user.is_active);
      console.log("   - Has password:", !!user.password);

      // Update admin user with new password
      console.log("\n🔐 Updating admin password...");
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const updateQuery = `
        UPDATE users 
        SET password = @password, 
            role = 'admin', 
            is_active = 1 
        WHERE email = @email
      `;

      const updateRequest = sql.request();
      updateRequest.input("email", sql.VarChar, adminEmail);
      updateRequest.input("password", sql.VarChar, hashedPassword);

      await updateRequest.query(updateQuery);
      console.log("✅ Admin user updated successfully");

      // Test password
      console.log("\n🧪 Testing password...");
      const isValid = await bcrypt.compare(adminPassword, hashedPassword);
      console.log("Password test result:", isValid);
    } else {
      console.log("❌ No admin user found, creating new one...");

      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const createQuery = `
        INSERT INTO users (email, password, first_name, last_name, role, is_active)
        VALUES (@email, @password, @firstName, @lastName, @role, @isActive)
      `;

      const createRequest = sql.request();
      createRequest.input("email", sql.VarChar, adminEmail);
      createRequest.input("password", sql.VarChar, hashedPassword);
      createRequest.input("firstName", sql.VarChar, "Admin");
      createRequest.input("lastName", sql.VarChar, "User");
      createRequest.input("role", sql.VarChar, "admin");
      createRequest.input("isActive", sql.Bit, true);

      await createRequest.query(createQuery);
      console.log("✅ Admin user created successfully");
    }

    // Display all users for reference
    console.log("\n📊 All users in database:");
    const allUsersQuery = `
      SELECT id, email, role, is_active, first_name, last_name,
             LEN(password) as password_length
      FROM users
    `;
    const allUsers = await sql.request().query(allUsersQuery);

    console.table(allUsers.recordset);

    console.log("\n🎯 Admin credentials:");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("Role: admin");
  } catch (error) {
    console.error("💥 Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await sql.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Script to diagnose login issues
async function diagnoseLostinIssues() {
  try {
    await sql.connect();
    console.log("✅ Connected to database");

    // Get all users and their details
    const query = `
      SELECT 
        id, email, role, is_active, 
        first_name, last_name, created_at,
        CASE 
          WHEN password IS NULL THEN 'NULL'
          WHEN LEN(password) = 0 THEN 'EMPTY'
          WHEN LEFT(password, 4) = '$2a$' OR LEFT(password, 4) = '$2b$' OR LEFT(password, 4) = '$2y$' THEN 'BCRYPT'
          ELSE 'PLAIN_TEXT'
        END as password_type,
        LEN(password) as password_length
      FROM users
      ORDER BY role DESC, created_at ASC
    `;

    const result = await sql.request().query(query);

    console.log("\n📊 User Analysis:");
    console.table(result.recordset);

    // Check for common issues
    console.log("\n🔍 Common Issues Check:");

    const issues = [];

    result.recordset.forEach((user) => {
      const userIssues = [];

      if (!user.is_active) {
        userIssues.push("Account inactive");
      }

      if (user.password_type === "NULL") {
        userIssues.push("No password set");
      }

      if (user.password_type === "EMPTY") {
        userIssues.push("Empty password");
      }

      if (user.password_type === "PLAIN_TEXT") {
        userIssues.push("Password not hashed");
      }

      if (userIssues.length > 0) {
        issues.push({
          email: user.email,
          role: user.role,
          issues: userIssues,
        });
      }
    });

    if (issues.length > 0) {
      console.log("❌ Issues found:");
      issues.forEach((issue) => {
        console.log(
          `   - ${issue.email} (${issue.role}): ${issue.issues.join(", ")}`
        );
      });
    } else {
      console.log("✅ No obvious issues found");
    }
  } catch (error) {
    console.error("💥 Error:", error.message);
  } finally {
    await sql.close();
  }
}

// Run the appropriate function based on command line argument
const command = process.argv[2];

if (command === "create-admin") {
  manageAdminUser();
} else if (command === "diagnose") {
  diagnoseLostinIssues();
} else {
  console.log("Usage:");
  console.log(
    "  node admin-script.js create-admin  - Create/update admin user"
  );
  console.log("  node admin-script.js diagnose      - Diagnose login issues");
}
