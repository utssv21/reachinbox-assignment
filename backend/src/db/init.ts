import { pool } from "../config/db";

export const createEmailsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS emails (
      id UUID PRIMARY KEY,
      sender_email TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      scheduled_at TIMESTAMP NOT NULL,
      sent_at TIMESTAMP,
      status TEXT DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    await pool.query(query);
    console.log("Emails table ready ✅");
  } catch (error) {
    console.error("Error creating table ❌", error);
  }
};
