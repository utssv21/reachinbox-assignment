import { pool } from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { emailQueue } from "../queue/emailQueue";

export const scheduleEmail = async (data: {
  sender_email: string;
  recipient_email: string;
  subject: string;
  body: string;
  scheduled_at: string;
}) => {
  const id = uuidv4();

  const scheduledTime = new Date(data.scheduled_at);
  const now = new Date();

  const delay = scheduledTime.getTime() - now.getTime();
  await pool.query(
    `INSERT INTO emails 
     (id, sender_email, recipient_email, subject, body, scheduled_at, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      data.sender_email,
      data.recipient_email,
      data.subject,
      data.body,
      scheduledTime,
      "scheduled",
    ]
  );


  await emailQueue.add(
    "sendEmail",
    { emailId: id },
    { delay: delay > 0 ? delay : 0 }
  );

  return { message: "Email scheduled successfully", id };
};
