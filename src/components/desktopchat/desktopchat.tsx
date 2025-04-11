"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollShadow } from "@heroui/scroll-shadow";
import clsx from "clsx";
import {
  PhoneIcon,
  VideoCameraIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/context/TokenProvider";
import { Message, User } from "@/src/interface/chatinterface";
import { API_BASE_URL } from "@/config/api";
import { io, Socket } from "socket.io-client";

// Sidebar Component
const Sidebar = ({
  users,
  onSelectUser,
  selectedUserId,
  currentUserId,
}: {
  users: User[];
  onSelectUser: (user: User) => void;
  selectedUserId: string | number | null;
  currentUserId: string;
}) => (
  <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700">
    <div className="shrink-0 p-4 text-lg font-semibold border-b border-zinc-200 dark:border-zinc-700">Chats</div>
    <div className="shrink-0 p-2 border-b border-zinc-200 dark:border-zinc-700">
      <input
        type="text"
        placeholder="Search..."
        className="w-full p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm focus:outline-none"
      />
    </div>
    <div className="flex-1 overflow-y-auto">
      <ScrollShadow className="h-full">
        <ul className="space-y-2 mt-1 px-2">
          {users.filter((user) => user.id !== currentUserId).map((user) => {
            const isSelected = user.id === selectedUserId;
            return (
              <li
                key={user.id}
                onClick={() => onSelectUser(user)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectUser(user)}
                className={clsx(
                  "group relative flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-sm transition-all duration-300 cursor-pointer",
                  {
                    "bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary/20": isSelected,
                    "bg-zinc-50/80 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70": !isSelected,
                  }
                )}
              >
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white font-semibold flex items-center justify-center text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                  {user.name.charAt(0).toUpperCase()}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className={clsx("font-medium text-base", {
                      "text-primary": isSelected,
                      "text-zinc-900 dark:text-zinc-100": !isSelected,
                    })}>
                      {user.name}
                    </span>
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full shadow-sm">3</span>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Active recently</span>
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollShadow>
    </div>
  </div>
);

// Chat Panel Component
const ChatPanel = ({
  selectedUser,
  onBack,
  messages,
  currentUserId,
  onSendMessage,
}: {
  selectedUser: User | null;
  onBack: () => void;
  messages: { [key: string]: Message[] };
  currentUserId: string;
  onSendMessage: (userId: string, message: string) => void;
}) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedMessages = selectedUser?.id ? messages[selectedUser.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);

  const send = () => {
    if (selectedUser && message.trim()) {
      onSendMessage(selectedUser.id, message.trim());
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack}>
              <ArrowLeftIcon className="block md:hidden w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white font-semibold flex items-center justify-center text-lg shadow-lg transition-transform duration-300">
                {selectedUser?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedUser?.name || "Select a user to chat"}
                </h2>
                {selectedUser && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
                    Active now
                  </p>
                )}
              </div>
            </div>
          </div>
          {selectedUser && (
            <div className="flex gap-4 items-center">
              <PhoneIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-blue-500 cursor-pointer transition" />
              <VideoCameraIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-blue-500 cursor-pointer transition" />
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedMessages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              "max-w-xs md:max-w-sm px-4 py-2 rounded-lg text-sm",
              msg.senderId === currentUserId
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
            )}
          >
            <div className="flex items-end justify-between gap-2">
              <span>{msg.text}</span>
              <span className="text-xs text-gray-400 ml-2">{msg.currenttime}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-md px-3 py-2">
          <input
            type="text"
            placeholder={`Message ${selectedUser?.name || "..."}`}
            disabled={!selectedUser}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 bg-transparent text-[16px] md:text-sm focus:outline-none disabled:opacity-50"
          />
          <PaperAirplaneIcon
            className={clsx(
              "w-5 h-5 text-blue-500 cursor-pointer rotate-45",
              (!message.trim() || !selectedUser) && "opacity-50 pointer-events-none"
            )}
            onClick={send}
          />
        </div>
      </div>
    </div>
  );
};

// Main DesktopChat Component
export default function DesktopChat() {
  const { token, isAuthenticated, user } = useAuth();
  const currentUserId = String(user?.id || "");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});

  useEffect(() => {
    if (!currentUserId) return;
  
    const newSocket = io("https://worksync-socket.onrender.com", {
      transports: ["websocket"],
    });
  
    setSocket(newSocket);
    newSocket.emit("register", currentUserId);
  
    newSocket.on("privateMessage", (data: Message) => {
      setMessages((prev) => ({
        ...prev,
        [data.senderId]: [...(prev[data.senderId] || []), data],
      }));
    });
  
    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);
  

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [token]);

  const handleSendMessage = async (receiverId: string, text: string) => {
    const msg: Message = {
      text,
      senderId: currentUserId,
      currenttime: new Date().toLocaleTimeString(),
    };
  
    // Emit message via Socket.IO
    if (socket) {
      socket.emit("privateMessage", {
        ...msg,
        receiverId,
      });
    }
  
    // Save to local state
    setMessages((prev) => ({
      ...prev,
      [receiverId]: [...(prev[receiverId] || []), msg],
    }));
  
    // Save to backend using fetch
    try {
      await fetch("https://worksync-backend.vercel.app/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Make sure token is available
        },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId,
          text,
        }),
      });
    } catch (error) {
      console.error("Error saving message to DB:", error);
    }
  };
  
  

  return (
    <div className="h-full w-full flex">
      <Sidebar
        users={users}
        onSelectUser={(user) => setSelectedUser(user)}
        selectedUserId={selectedUser?.id || null}
        currentUserId={currentUserId}
      />
      <ChatPanel
        selectedUser={selectedUser}
        onBack={() => setSelectedUser(null)}
        messages={messages}
        currentUserId={currentUserId}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
