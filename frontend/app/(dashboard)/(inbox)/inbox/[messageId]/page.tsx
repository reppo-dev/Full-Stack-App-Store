"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const MessageDetail = () => {
  const router = useRouter();

  return (
    <div className="p-6 w-full mx-auto flex flex-col h-[90vh]">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-blue-600 hover:underline self-start"
      >
        ← Back to list
      </button>

      <div className="flex flex-col flex-1 border rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">...</h2>
          <p className="text-xs text-gray-500">..</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <div>
              <div className="flex justify-between items-center gap-2 mb-1">
                <span className="font-medium text-xs"></span>
                <span className="text-[10px] opacity-70"></span>
              </div>
              <p className="whitespace-pre-wrap">jjj</p>
              <div className="flex gap-1 mt-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] text-white">
                  lll
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t p-4">
          <textarea
            placeholder="Write your reply..."
            className="w-full border rounded-md p-3 text-sm min-h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button>Send Reply</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
