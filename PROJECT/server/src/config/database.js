import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || "sa", 
  password: process.env.DB_PASSWORD || "YourStrong@Passw0rd",
  server: process.env.DB_HOST || "localhost", 
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || "AzureHaven",
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true, 
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export { sql, dbConfig };
