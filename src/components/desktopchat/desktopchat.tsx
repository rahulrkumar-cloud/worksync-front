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
  selectedUserId: any;
  users: User[];
  onSelectUser: (user: User) => void;
  currentUserId: any;
}

const Sidebar = ({ users, onSelectUser, selectedUserId, currentUserId }: SidebarProps) => (
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
          {users
            .filter((user) => user.id !== currentUserId).map((user) => {
              const isSelected = user.id === selectedUserId;

              return (
                <li
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelectUser(user);
                  }}
                  className={clsx(
                    "group relative flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900",
                    {
                      // Light mode selected background
                      "bg-primary/10 hover:bg-primary/20 text-primary": isSelected,
                      // Dark mode selected background
                      "dark:bg-primary/20 dark:hover:bg-primary/30": isSelected,
                      // Non-selected
                      "bg-zinc-50/80 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70": !isSelected,
                    }
                  )}
                >
                  {/* Avatar with online dot */}
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white font-semibold flex items-center justify-center text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                    {user.name.charAt(0).toUpperCase()}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                  </div>

                  {/* User Info */}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <span className={clsx("font-medium text-base", {
                        "text-primary": isSelected,
                        "text-zinc-900 dark:text-zinc-100": !isSelected,
                      })}>
                        {user.name}
                      </span>

                      {/* Optional unread badge */}
                      <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                        3
                      </span>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      Active recently
                    </span>
                  </div>
                </li>
              );
            })}
        </ul>


      </ScrollShadow>
    </div>
  </div>
);

interface ChatPanelProps {
  selectedUser: User | null;
  onBack: () => void;
  messages: { [key: string]: Message[] };
  currentUserId: string;
  onSendMessage: (userId: string, message: string) => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}


const ChatPanel = ({
  selectedUser,
  onBack,
  messages,
  currentUserId,
  onSendMessage,
  message,
  setMessage,
}: ChatPanelProps) => {

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedMessages = selectedUser?.id && messages?.[selectedUser.id]
    ? messages[selectedUser.id]
    : [];

  const isActiveNow = true;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex justify-between items-center gap-4">
          {/* Left Side - Back button + Avatar + Info */}
          <div className="flex items-center gap-3">
            <button onClick={onBack}>
              <ArrowLeftIcon className="block md:hidden w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white font-semibold flex items-center justify-center text-lg shadow-lg transition-transform duration-300">
                {selectedUser?.name.charAt(0).toUpperCase()}
              </div>

              {/* Name + Status */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {selectedUser
                      ? `${selectedUser.name}`
                      : "Select a user to start chatting"}
                  </h2>
                </div>

                {selectedUser && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                    {isActiveNow && (
                      <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
                    )}
                    {isActiveNow ? "Active now" : "Last seen recently"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Call icons */}
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
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io("https://worksync-socket.onrender.com", {
      transports: ["websocket"],
    });

    setSocket(newSocket);
    newSocket.emit("register", currentUserId);

    newSocket.on("privateMessage", (data: Message) => {
      const senderId = String(data.senderId);
      const isIncoming = senderId !== currentUserId;

      // Only update if incoming message (avoid duplication)
      if (isIncoming) {
        setMessages((prev) => ({
          ...prev,
          [senderId]: [...(prev[senderId] || []), data],
        }));
      }
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
          method: "GET",
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
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/messages/${selectedUser.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch messages");

        const rawData: {
          id: number;
          sender_id: number;
          receiver_id: number;
          message: string;
          created_at: string;
        }[] = await res.json();

        const transformed1: Message[] = rawData.map((msg) => ({
          text: msg.message,
          senderId: String(msg.sender_id),
          currenttime: new Date(msg.created_at).toISOString().slice(11, 19),
        }));


        // const data = await res.json();
        // const transformed = data.map((msg: any) => ({
        //   text: msg.message,
        //   senderId: String(msg.sender_id),
        //   currenttime: new Date(msg.created_at).toISOString().slice(11, 19),
        // }));
        // setMessages((prev) => ({
        //   ...prev,
        //   [selectedUser.id]: transformed,
        // }));
        setMessages((prev) => ({
          ...prev,
          [selectedUser?.id]: transformed1,
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
    setSelectedUserId(user.id)
  };

  const handleBack = () => {
    setIsMobileChatOpen(false);
  };

  // const handleSendMessage = async (receiverId: string, text: string) => {
  //   if (!text.trim() || !receiverId || !socket) return;

  //   const msgData: Message = {
  //     text,
  //     senderId: currentUserId,
  //     currenttime: new Date().toLocaleTimeString(),
  //   };

  //   socket.emit("privateMessage", { ...msgData, receiverId });

  //   try {
  //     const res = await fetch(`${API_BASE_URL}/messages/send/${receiverId}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ message: text }),
  //     });

  //     if (!res.ok) throw new Error("Failed to send message");

  //     setMessages((prev) => ({
  //       ...prev,
  //       [receiverId]: [...(prev[receiverId] || []), msgData],
  //     }));
  //   } catch (err) {
  //     console.error("Error sending message:", err);
  //   }
  // };


  // handleSendMessage
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser || !socket) return;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString();

    const msgData: Message = {
      text: message,
      senderId: currentUserId,
      currenttime: formattedTime,
    };

    // Optimistically update UI before server response
    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), msgData],
    }));
    setMessage("");

    socket.emit("privateMessage", {
      ...msgData,
      receiverId: selectedUser.id,
    });

    try {
      await fetch(`${API_BASE_URL}/messages/send/${selectedUser.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
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
      <div className="hidden md:flex h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-md">
        {/* Sidebar */}
        <div
          className={clsx(
            "w-full md:w-[30%] h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
            isMobileChatOpen ? "hidden md:block" : "block"
          )}
        >
          <Sidebar users={users} onSelectUser={handleSelectUser} selectedUserId={selectedUserId} currentUserId={currentUserId} />
        </div>

        {/* Chat Panel */}
        <div
          className={clsx(
            "w-full md:w-[70%] h-full bg-zinc-50 dark:bg-zinc-950",
            isMobileChatOpen ? "block" : "hidden",
            "md:block"
          )}
        >
         <ChatPanel
  selectedUser={selectedUser}
  onBack={handleBack}
  messages={messages}
  currentUserId={currentUserId}
  onSendMessage={handleSendMessage}
  message={message}
  setMessage={setMessage}
/>


        </div>
      </div>

    </>
  );
}
