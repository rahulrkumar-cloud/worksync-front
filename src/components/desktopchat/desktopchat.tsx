"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollShadow } from "@heroui/scroll-shadow";
import clsx from "clsx";
import {
  PhoneIcon,
  VideoCameraIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/context/TokenProvider";
import { Message, User } from "@/src/interface/chatinterface";
import { API_BASE_URL } from "@/config/api";
import { io, Socket } from "socket.io-client";

// Sidebar
interface SidebarProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

const Sidebar = ({ users, onSelectUser }: SidebarProps) => (
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
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {users.map((user) => (
            <li
              key={user.id}
              className="p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              onClick={() => onSelectUser(user)}
            >
              {user.name}
            </li>
          ))}
        </ul>
      </ScrollShadow>
    </div>
  </div>
);

// ChatPanel
interface ChatPanelProps {
  selectedUser: User | null;
  onBack: () => void;
  messages: { [key: string]: Message[] };
  currentUserId: string;
  onSendMessage: (userId: string, message: string) => void;
}

const ChatPanel = ({
  selectedUser,
  onBack,
  messages,
  currentUserId,
  onSendMessage,
}: ChatPanelProps) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedMessages = selectedUser?.id && messages?.[selectedUser.id]
    ? messages[selectedUser.id]
    : [];

  const isActiveNow = true;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={onBack}>
            <ArrowLeftIcon className="block md:hidden w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-lg font-semibold">
              {selectedUser ? `Chat with ${selectedUser.name}` : "Select a user to start chatting"}
            </h2>
            {selectedUser && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                {isActiveNow && (
                  <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                )}
                {isActiveNow ? "Active now" : "Last seen recently"}
              </p>
            )}
          </div>
        </div>
        {selectedUser && (
          <div className="flex gap-4">
            <PhoneIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-blue-500 cursor-pointer" />
            <VideoCameraIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-blue-500 cursor-pointer" />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedUser &&
          selectedMessages.map((msg, i) => (
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim() && selectedUser) {
                onSendMessage(selectedUser.id, message.trim());
                setMessage("");
              }
            }}
            className="flex-1 bg-transparent text-[16px] md:text-sm focus:outline-none disabled:opacity-50"
          />
          <PaperAirplaneIcon
            className={clsx(
              "w-5 h-5 text-blue-500 cursor-pointer rotate-45",
              (!message.trim() || !selectedUser) && "opacity-50 pointer-events-none"
            )}
            onClick={() => {
              if (selectedUser && message.trim()) {
                onSendMessage(selectedUser.id, message.trim());
                setMessage("");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function DesktopChat() {
  const { token, isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const currentUserId = String(user?.id || "");

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
        [String(data.senderId)]: [...(prev[String(data.senderId)] || []), data],
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
        if (!res.ok) throw new Error("Failed to fetch users");
        const data: User[] = await res.json();
        setUsers(data.map((user) => ({ ...user, id: String(user.id) })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;

      try {
        const res = await fetch(`${API_BASE_URL}/messages/${selectedUser.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        const transformed = data.map((msg: any) => ({
          text: msg.message,
          senderId: String(msg.sender_id),
          currenttime: new Date(msg.created_at).toISOString().slice(11, 19),
        }));
        setMessages((prev) => ({
          ...prev,
          [selectedUser.id]: transformed,
        }));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [selectedUser, token]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsMobileChatOpen(true);
  };

  const handleBack = () => {
    setIsMobileChatOpen(false);
  };

  const handleSendMessage = async (receiverId: string, text: string) => {
    if (!text.trim() || !receiverId || !socket) return;

    const msgData: Message = {
      text,
      senderId: currentUserId,
      currenttime: new Date().toLocaleTimeString(),
    };

    socket.emit("privateMessage", { ...msgData, receiverId });

    try {
      const res = await fetch(`${API_BASE_URL}/messages/send/${receiverId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setMessages((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), msgData],
      }));
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <>
      {/* Mobile Not Supported */}
      <div className="md:hidden flex items-center justify-center h-screen w-screen bg-white dark:bg-zinc-900 text-center px-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Mobile Not Supported</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please use a desktop or tablet to access the chat.
          </p>
        </div>
      </div>

      {/* Desktop/Tablet UI */}
      <div className="hidden md:flex h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] w-full">
        <div className={clsx("w-full md:w-[30%] h-full", isMobileChatOpen ? "hidden md:block" : "block")}>
          <Sidebar users={users} onSelectUser={handleSelectUser} />
        </div>

        <div className={clsx("w-full md:w-[70%] h-full bg-zinc-50 dark:bg-zinc-950", isMobileChatOpen ? "block" : "hidden", "md:block")}>
          <ChatPanel
            selectedUser={selectedUser}
            onBack={handleBack}
            messages={messages}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </>
  );
}
