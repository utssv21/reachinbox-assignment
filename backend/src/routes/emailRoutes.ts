import { Router } from "express";
import { scheduleEmail } from "../services/emailService";
import { pool } from "../config/db";

const router = Router();


router.post("/schedule", async (req, res) => {
  try {
    const {
      sender_email,
      recipient_email,
      subject,
      body,
      scheduled_at,
    } = req.body;

    // Basic validation
    if (
      !sender_email ||
      !recipient_email ||
      !subject ||
      !body ||
      !scheduled_at
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const result = await scheduleEmail(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
});


router.get("/scheduled", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM emails WHERE status = 'scheduled' ORDER BY scheduled_at ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch scheduled emails",
    });
  }
});


router.get("/sent", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM emails WHERE status = 'sent' ORDER BY sent_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch sent emails",
    });
  }
});

export default router;
