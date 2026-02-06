"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

type Email = {
  id: string;
  sender_email: string;
  recipient_email: string;
  subject: string;
  body: string;
  status: string;
  scheduled_at: string;
  sent_at?: string;
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    recipient_email: "",
    subject: "",
    body: "",
    scheduled_at: "",
  });

  const fetchEmails = async () => {
    setLoading(true);

    const endpoint =
      activeTab === "scheduled"
        ? "http://localhost:5000/api/email/scheduled"
        : "http://localhost:5000/api/email/sent";

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [activeTab]);

  const handleSubmit = async () => {
    try {
      await fetch("http://localhost:5000/api/email/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_email: session?.user?.email,
          ...formData,
        }),
      });

      setShowModal(false);
      setFormData({
        recipient_email: "",
        subject: "",
        body: "",
        scheduled_at: "",
      });

      fetchEmails();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow">
        <h1 className="text-xl font-bold">ReachInbox Scheduler</h1>

        <div className="flex items-center gap-4">
          <img
            src={session?.user?.image || ""}
            className="w-10 h-10 rounded-full"
          />
          <div className="text-sm">
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-gray-500">{session?.user?.email}</p>
          </div>

          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 mt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-6 border-b pb-2">
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`${
                activeTab === "scheduled"
                  ? "border-b-2 border-black font-bold"
                  : ""
              }`}
            >
              Scheduled Emails
            </button>

            <button
              onClick={() => setActiveTab("sent")}
              className={`${
                activeTab === "sent"
                  ? "border-b-2 border-black font-bold"
                  : ""
              }`}
            >
              Sent Emails
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Compose Email
          </button>
        </div>

        <div className="bg-white p-6 rounded shadow">
          {loading ? (
            <p>Loading...</p>
          ) : emails.length === 0 ? (
            <p>No emails found.</p>
          ) : (
            <div className="space-y-4">
              {emails.map((email) => (
                <div key={email.id} className="border p-4 rounded bg-gray-50">
                  <p className="font-semibold">{email.subject}</p>
                  <p className="text-sm text-gray-600">
                    To: {email.recipient_email}
                  </p>
                  <p className="text-sm mt-2">{email.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96 space-y-4">
            <h2 className="text-lg font-bold">Compose Email</h2>

            <input
              type="email"
              placeholder="Recipient Email"
              className="w-full border p-2 rounded"
              value={formData.recipient_email}
              onChange={(e) =>
                setFormData({ ...formData, recipient_email: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Subject"
              className="w-full border p-2 rounded"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />

            <textarea
              placeholder="Body"
              className="w-full border p-2 rounded"
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
            />

            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={formData.scheduled_at}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_at: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-black text-white px-3 py-1 rounded"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
