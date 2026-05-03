"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface FullMessage {
  ID: number;
  subject: string;
  body: string;
  snippet: string;
  created_at: string;
  sender_id: number;
  recipient_id: number;
  sender?: {
    first_name: string;
    last_name?: string;
    user_name?: string;
  };
  labels: { ID: number; name: string; color_code: string }[];
  CreatedAt: string;
}

const MessageDetail = () => {
  const params = useParams();
  const router = useRouter();
  const messageId = params.messageId as string;

  const [message, setMessage] = useState<FullMessage | null>(null); // پیام اصلی
  const [conversation, setConversation] = useState<FullMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // مرحله ۱: دریافت پیام اصلی
  useEffect(() => {
    const fetchInitialMessage = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/messages/${messageId}`,
          {
            withCredentials: true,
          },
        );
        setMessage(res.data);
        return res.data.sender_id; // برای مرحله بعد
      } catch (err) {
        console.error("Failed to load message", err);
        return null;
      }
    };

    if (messageId) {
      fetchInitialMessage().then((senderId) => {
        if (senderId) {
          // مرحله ۲: دریافت کامل گفتگو
          axios
            .get(`http://localhost:3000/api/conversations/${senderId}`, {
              withCredentials: true,
            })
            .then((res) => {
              setConversation(res.data);
            })
            .catch((err) => console.error("Failed to load conversation", err))
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
    }
  }, [messageId]);

  // اسکرول خودکار به انتهای چت
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSendReply = async () => {
    if (!message || !replyBody.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/messages",
        {
          recipient_id: message.sender_id,
          subject: message.subject.startsWith("Re:")
            ? message.subject
            : `Re: ${message.subject}`,
          body: replyBody,
          snippet: replyBody.substring(0, 100),
          is_draft: false,
        },
        { withCredentials: true },
      );
      setReplyBody("");
      // اضافه کردن پیام جدید به انتهای گفتگو (بدون fetch دوباره)
      setConversation((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to send reply", err);
      alert("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!message) return <p className="p-4">Message not found.</p>;

  return (
    <div className="p-6 w-full mx-auto flex flex-col h-[90vh]">
      {/* هدر */}
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-blue-600 hover:underline self-start"
      >
        ← Back to list
      </button>

      <div className="flex flex-col flex-1 border rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
        {/* عنوان گفتگو */}
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">{message.subject}</h2>
          <p className="text-xs text-gray-500">
            Conversation with {message.sender?.first_name}{" "}
            {message.sender?.last_name}
          </p>
        </div>

        {/* لیست پیام‌ها */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {conversation.map((msg) => {
            const isMine = msg.sender_id === message.recipient_id; // ادمین = recipient اصلی پیام؟ درست‌تر: مقایسه با userID فعلی
            return (
              <div
                key={msg.ID}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                    isMine
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                  }`}
                >
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <span className="font-medium text-xs">
                      {isMine
                        ? "You"
                        : `${msg.sender?.first_name} ${msg.sender?.last_name}`}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {new Date(msg.CreatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                  {msg.labels?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {msg.labels.map((lbl) => (
                        <span
                          key={lbl.ID}
                          className="px-1.5 py-0.5 rounded text-[10px] text-white"
                          style={{ backgroundColor: lbl.color_code }}
                        >
                          {lbl.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* باکس پاسخ */}
        <div className="border-t p-4">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write your reply..."
            className="w-full border rounded-md p-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleSendReply}
              disabled={!replyBody.trim() || sending}
            >
              {sending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
