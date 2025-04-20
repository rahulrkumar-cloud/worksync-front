"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from "react";
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
  const socketRef = useRef<Socket | null>(null); // <== Use ref to persist socket
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!currentUserId || socketRef.current) return;

    const socket = io("https://worksync-socket-j50v.onrender.com", {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    // On successful connection
    socket.on("connect", () => {
      console.log(`✅ Connected to socket: ${socket.id}`);
      socket.emit("register", currentUserId); // Register only once per connect
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.warn(`❌ Disconnected:`, reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("🚨 Connection error:", error.message);
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.info(`🔁 Reconnect attempt #${attempt}`);
    });

    // Heartbeat to keep socket alive
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        console.log("💓 Sending heartbeat");
        socket.emit("heartbeat");
      }
    }, 60000);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [currentUserId]);

  const contextValue = useMemo(
    () => ({ socket: socketRef.current }),
    [isConnected] // triggers update only when connection state changes
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
