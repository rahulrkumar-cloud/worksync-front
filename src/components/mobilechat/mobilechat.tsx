"use client";

import { useEffect, useRef, useState } from "react";
import {
    UserCircleIcon,
    ArrowLeftIcon,
    PhoneIcon,
    VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/context/TokenProvider";
import { Message, User } from "@/src/interface/chatinterface";
import { API_BASE_URL } from "@/config/api";
import { io, Socket } from "socket.io-client";
import clsx from "clsx";

export default function Mobilechat() {
    const { token, isAuthenticated, user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUserId = String(user?.id || "");

    // 1. Initialize socket connection and receive messages
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

    // 2. Fetch users
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

    // 3. Fetch message history for selected user
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

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedUser || !socket) return;

        const msgData: Message = {
            text: message,
            senderId: currentUserId,
            currenttime: new Date().toLocaleTimeString(),
        };

        socket.emit("privateMessage", {
            ...msgData,
            receiverId: selectedUser.id,
        });

        try {
            const res = await fetch(`${API_BASE_URL}/messages/send/${selectedUser.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message }),
            });

            if (!res.ok) throw new Error("Failed to send message");

            setMessages((prev) => ({
                ...prev,
                [selectedUser.id]: [...(prev[selectedUser.id] || []), msgData],
            }));
            setMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const selectedMessages = selectedUser?.id ? messages[selectedUser.id] || [] : [];

    return (
        <div className="block md:hidden h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
            {!selectedUser ? (
                // User List
                <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700">
                    <div className="shrink-0 p-4 text-lg font-semibold border-b border-zinc-200 dark:border-zinc-700">
                        Chats
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {users.map((user) => (
                                // <li
                                //     key={user.id}
                                //     className="p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                                //     onClick={() => setSelectedUser(user)}
                                // >
                                //     {user.name}
                                // </li>
                                <li
                                    key={user.id}
                                    className="p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                                    onClick={() => setSelectedUser(user)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") setSelectedUser(user);
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    {user.name}
                                </li>

                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                // Chat View
                <div className="fixed inset-0 bg-white dark:bg-gray-900 z-20 flex flex-col">
                    {/* Header */}
                    <div className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 p-4 z-30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedUser(null)}>
                                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                                    Active now
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <PhoneIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            <VideoCameraIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 space-y-3 py-[155px]"
                    >
                        {selectedMessages.map((msg, i) => (
                            <div
                                key={i}
                                className={clsx(
                                    "max-w-xs px-4 py-2 rounded-lg text-sm break-words",
                                    msg.senderId === currentUserId
                                        ? "ml-auto bg-blue-500 text-white"
                                        : "mr-auto bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
                                )}
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="break-words whitespace-pre-wrap">{msg.text}</span>
                                    <span className="text-xs text-gray-400 self-end">{msg.currenttime}</span>
                                </div>
                            </div>

                        ))}
                        <div ref={messagesEndRef} />
                    </div>


                    {/* Input */}

                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 p-4 z-30">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={`Message ${selectedUser.name}`}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSendMessage();
                                }}
                                className="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <PaperAirplaneIcon
                                className={clsx(
                                    "w-5 h-5 text-blue-500 cursor-pointer rotate-45 absolute right-3 top-1/2 -translate-y-1/2",
                                    (!message.trim() || !selectedUser) && "opacity-50 pointer-events-none"
                                )}
                                onClick={handleSendMessage}
                            />
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
