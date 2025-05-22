import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "YourStrong@Passw0rd",
  server: process.env.DB_HOST || "localhost",
  port: 1433, // Make sure port is a number
  database: process.env.DB_NAME || "AzureHaven",
  // Move encrypt and trustServerCertificate to root level
  encrypt: process.env.DB_ENCRYPT === "true" || true,
  trustServerCertificate:
    process.env.DB_TRUST_SERVER_CERTIFICATE === "true" || true,
  enableArithAbort: true,
  // Connection timeout settings
  connectionTimeout: 60000, // 60 seconds
  requestTimeout: 60000, // 60 seconds
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    // Keep additional options here if needed
    useUTC: true,
    dateFirst: 1,
  },
};

// Add connection validation
const validateConfig = () => {
  const required = ["user", "password", "server", "database"];
  const missing = required.filter((key) => !dbConfig[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required database configuration:", missing);
    console.error("Current config:", {
      user: dbConfig.user,
      server: dbConfig.server,
      port: dbConfig.port,
      database: dbConfig.database,
      // Don't log password for security
      password: dbConfig.password ? "[SET]" : "[NOT SET]",
    });
    throw new Error(`Missing database configuration: ${missing.join(", ")}`);
  }

  console.log("✅ Database configuration validated");
  console.log("📊 Connection details:", {
    server: dbConfig.server,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    encrypt: dbConfig.encrypt,
    trustServerCertificate: dbConfig.trustServerCertificate,
  });
};

// Test connection function
export const testConnection = async () => {
  try {
    validateConfig();
    console.log("🔌 Testing database connection...");

    const pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();

    console.log("✅ Database connection successful!");

    // Test a simple query
    const result = await pool.request().query("SELECT 1 as test");
    console.log("✅ Database query test successful:", result.recordset);

    await pool.close();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);

    // Provide helpful error messages for common issues
    if (error.code === "ECONNREFUSED") {
      console.error(
        "💡 Suggestion: Check if SQL Server is running and accessible"
      );
    } else if (error.code === "ELOGIN") {
      console.error("💡 Suggestion: Check username and password");
    } else if (error.code === "EINSTLOOKUP") {
      console.error("💡 Suggestion: Check server name and port");
    }

    return false;
  }
};

// Validate configuration on import
try {
  validateConfig();
} catch (error) {
  console.error("Database configuration error:", error.message);
}

export { sql, dbConfig };
