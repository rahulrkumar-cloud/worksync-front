"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/TokenProvider";
import { Message } from "@/src/interface/chatinterface";

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
    });

    setSocket(newSocket);
    newSocket.emit("register", currentUserId);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
