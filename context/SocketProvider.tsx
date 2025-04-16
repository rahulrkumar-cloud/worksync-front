"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/TokenProvider";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const currentUserId = String(user?.id || "");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io("https://worksync-socket.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
      // timeout: 10000, // optional: sets connect timeout
    });

    setSocket(newSocket);

    // Logs
    newSocket.on("connect", () => {
      console.log(`✅ Connected to socket server: ${newSocket.id}`);
      newSocket.emit("register", currentUserId);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn(`❌ Disconnected from socket server:`, reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("🚨 Connection error:", error.message);
    });

    newSocket.on("reconnect_attempt", (attempt) => {
      console.info(`🔁 Reconnect attempt #${attempt}`);
    });

    // Send heartbeat every 60s (less than pingTimeout = 180s)
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        console.log("💓 Sending heartbeat");
        newSocket.emit("heartbeat");
      }
    }, 60000);

    return () => {
      clearInterval(heartbeatInterval);
      newSocket.disconnect();
    };
  }, [currentUserId]);

  const contextValue = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
