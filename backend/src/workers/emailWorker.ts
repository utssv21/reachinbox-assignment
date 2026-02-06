import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { pool } from "../config/db";
import { emailQueue } from "../queue/emailQueue";
import nodemailer from "nodemailer";

/**
 * 🔥 Create Ethereal Transporter
 * (Put your real Ethereal credentials in .env)
 */
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

const worker = new Worker(
  "emailQueue",
  async (job) => {
    const { emailId } = job.data;

    console.log("Processing job:", emailId);

    // 1️⃣ Fetch email from DB
    const result = await pool.query(
      "SELECT * FROM emails WHERE id = $1",
      [emailId]
    );

    const email = result.rows[0];

    if (!email) {
      console.log("Email not found ❌");
      return;
    }

    // 2️⃣ Idempotency check
    if (email.status === "sent") {
      console.log("Already sent, skipping");
      return;
    }

    /**
     * 3️⃣ Hourly Rate Limiting
     */
    const currentHourKey = `rate:${email.sender_email}:${new Date().toISOString().slice(0, 13)}`;

    const count = await redisConnection.incr(currentHourKey);

    if (count === 1) {
      await redisConnection.expire(currentHourKey, 3600);
    }

    const MAX_PER_HOUR =
      Number(process.env.MAX_EMAILS_PER_HOUR) || 10;

    if (count > MAX_PER_HOUR) {
      console.log("Rate limit exceeded. Rescheduling...");

      // Reschedule after 1 hour
      await emailQueue.add(
        "sendEmail",
        { emailId },
        { delay: 60 * 60 * 1000 }
      );

      return;
    }

    /**
     * 4️⃣ Send Email via Ethereal
     */
    const info = await transporter.sendMail({
      from: email.sender_email,
      to: email.recipient_email,
      subject: email.subject,
      text: email.body,
    });

    console.log("Email sent:", info.messageId);

    /**
     * 5️⃣ Mark as sent
     */
    await pool.query(
      "UPDATE emails SET status = $1, sent_at = NOW() WHERE id = $2",
      ["sent", emailId]
    );

    console.log("Email marked as sent ✅");
  },
  {
    connection: redisConnection,
    concurrency:
      Number(process.env.WORKER_CONCURRENCY) || 5,
    limiter: {
      max: 1, // minimum delay between jobs
      duration: 2000, // 2 seconds
    },
  }
);

worker.on("completed", (job) => {
  console.log("Job completed:", job.id);
});

worker.on("failed", (job, err) => {
  console.error("Job failed:", err);
});
