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
import {
    Navbar as HeroUINavbar,
    NavbarContent,
    NavbarBrand,
    NavbarItem,
} from "@heroui/navbar";
export default function Mobilechat() {
    const { token, isAuthenticated, user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUserId = String(user?.id || "");

    // Inside your Chat component:
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedUser?.id, selectedUser ? messages[selectedUser.id]?.length : null]);



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
            if (!token) return;
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
    const isActiveNow = true;

    return (
        <div className="block md:hidden h-screen bg-white dark:bg-gray-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-md">
            {!selectedUser ? (
                // User List
                <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700">

                    <div className="shrink-0 p-4 text-lg font-semibold border-b border-zinc-200 dark:border-zinc-700">
                        Chats
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <ul className="space-y-2">
                            {users
                                .filter((user) => user.id !== currentUserId)
                                .map((user) => (
                                    <li
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") setSelectedUser(user);
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        className="group relative flex items-center gap-4 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-md hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {/* Avatar */}
                                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                                            {user.name.charAt(0).toUpperCase()}
                                            {/* Online dot */}
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-base">
                                                    {user.name}
                                                </span>
                                                {/* Unread badge (optional logic) */}
                                                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                                                    2
                                                </span>
                                            </div>
                                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                Online now • Tap to chat
                                            </span>
                                        </div>
                                    </li>
                                ))}
                        </ul>

                    </div>
                </div>
            ) : (
                // Chat View

                < div className="fixed inset-0 z-20 flex flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">

                    {/* Header */}
                    <div className="fixed top-16 left-0 right-0 z-30 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm flex items-center justify-between rounded-b-2xl">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                                <ArrowLeftIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                            </button>
                            {/* <div className="flex flex-col">
                                <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                    {selectedUser.name}
                                </div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
                                    Active now
                                </p>
                            </div> */}
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
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                                <PhoneIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                            </button>
                            <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                                <VideoCameraIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        id="mobile-chat-scroll-container"
                        className="flex-1 overflow-y-auto px-4 space-y-3 py-[155px]  bg-zinc-50 dark:bg-zinc-950">
                        {selectedMessages.map((msg, i) => (
                            <div
                                key={i}
                                className={clsx(
                                    "max-w-xs px-4 py-2 rounded-xl text-sm break-words shadow-sm transition-transform duration-300",
                                    msg.senderId === currentUserId
                                        ? "ml-auto bg-blue-500 text-white"
                                        : "mr-auto bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
                                )}
                            >
                                <div className="flex flex-col gap-1 text-[15px] leading-relaxed font-medium text-zinc-800 dark:text-zinc-100 animate-fadeIn">
                                    <span className="break-words whitespace-pre-wrap">
                                        {msg.text}
                                    </span>
                                    <span className="text-[11px] text-gray-400 font-normal self-end mt-1">
                                        {msg.currenttime}
                                    </span>
                                </div>


                            </div>
                        ))}
                    </div>
                    {/* Scroll to Bottom Button */}
                    {/* <button
                        onClick={() => {
                            const chatContainer = document.getElementById("mobile-chat-scroll-container");
                            chatContainer?.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
                        }}
                        className="fixed bottom-20 right-4 z-40 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75L12 20.25L4.5 12.75" />
                        </svg>
                    </button> */}
                    {/* Input */}
                    <div className="fixed bottom-0 left-0 right-0 z-30 px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={`Message ${selectedUser.name}`}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSendMessage();
                                }}
                                className="w-full border dark:border-zinc-600 dark:bg-zinc-800 dark:text-white rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400"
                            />
                            <PaperAirplaneIcon
                                className={clsx(
                                    "w-5 h-5 text-blue-500 cursor-pointer rotate-45 absolute right-3 top-1/2 -translate-y-1/2 transition-transform",
                                    (!message.trim() || !selectedUser) && "opacity-50 pointer-events-none"
                                )}
                                onClick={handleSendMessage}
                            />
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
