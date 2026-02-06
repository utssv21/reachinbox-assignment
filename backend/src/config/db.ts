import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "reachinbox",
  password: "password",
  port: 5432,
});

pool.connect()
  .then(() => {
    console.log("Connected to PostgreSQL ✅");
  })
  .catch((err) => {
    console.error("Database connection error ❌", err);
  });
