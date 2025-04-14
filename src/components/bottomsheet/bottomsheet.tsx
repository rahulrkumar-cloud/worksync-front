'use client';

import { Sheet } from 'react-modal-sheet';
import { useEffect, useRef, useState } from 'react';
import {
    useOverlayTriggerState,
    OverlayTriggerState,
} from 'react-stately';

import {
    useOverlay,
    useModal,
    OverlayProvider,
    FocusScope,
    useButton,
    useDialog,
} from 'react-aria';
import { io, Socket } from "socket.io-client";
import { ChatSheet } from './ChatSheet';
import { ContactListAndUserChatSheet } from './ContactListAndUserChatSheet';
import { ContactListSheet } from './ContactListSheet';
import { useAuth } from '@/context/TokenProvider';
import { Message, User } from '@/src/interface/chatinterface';
import { API_BASE_URL } from '@/config/api';
interface Contact {
    id: number;
    name: string;
    messages: string[];
}

interface DesktopContact {
    id: number;
    name: string;
}

const contacts: Contact[] = [
    { id: 1, name: 'Alice', messages: ['Hey!', 'How are you?'] },
    { id: 2, name: 'Bob', messages: ['Yo!', 'What’s up?'] },
    { id: 3, name: 'Charlie', messages: ['Hello!', 'Long time no see!'] },
];

export default function MySheet() {
    const contactSheetState = useOverlayTriggerState({});
    const chatSheetState = useOverlayTriggerState({});
    const openButtonRef = useRef(null);
    const openButton = useButton({ onPress: contactSheetState.open }, openButtonRef);
    const [selectedContact, setSelectedContact] = useState<number | null>(null);

    const { token, isAuthenticated, user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
    const currentUserId = String(user?.id || "");
    const [socket, setSocket] = useState<Socket | null>(null);
    const prevSelectedContactRef = useRef<Contact | number | null>(null);
    const [message, setMessage] = useState("");
    const [selectedContactData, setSelectedContactData] = useState<Contact | null>(null);


    const handleContactClick = (contact: Contact) => {
        setSelectedContactData(contact)
        setSelectedContact(contact?.id);
        chatSheetState.open();
    };

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
        if (prevSelectedContactRef.current !== selectedContact) {
        const fetchMessages = async () => {
            console.log("Entering!!!")
            if (!selectedContact || !token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/messages/${selectedContact}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch messages");
    
                const rawData = await res.json();
    
                const transformed1: Message[] = rawData.map((msg: any) => ({
                    text: msg.message,
                    senderId: String(msg.sender_id),
                    currenttime: new Date(msg.created_at).toISOString().slice(11, 19),
                }));
    
                setMessages((prev) => ({
                    ...prev,
                    [selectedContact]: transformed1,
                }));
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };
        prevSelectedContactRef.current = selectedContact;
        fetchMessages();
    }
    
    }, [selectedContact]);

const handleSendMessage = async (messageText: string, receiverId: number) => {
    console.log("messageText",messageText,typeof receiverId,receiverId)
    if (!messageText.trim() || !receiverId || !socket) return;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString();

    const msgData: Message = {
        text: messageText,
        senderId: currentUserId,
        currenttime: formattedTime,
    };

    setMessages((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), msgData],
    }));

    socket.emit("privateMessage", {
        ...msgData,
        receiverId,
    });

    try {
        await fetch(`${API_BASE_URL}/messages/send/${receiverId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: messageText }),
        });
    } catch (err) {
        console.error("Error sending message:", err);
    }
};



    console.log("users", users, messages,selectedContact)
    return (
        <div className="p-6">
            <button
                {...openButton.buttonProps}
                ref={openButtonRef}
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all"
            >
                Open WhatsApp Drawer
            </button>

            {/* Contact Sheet */}
            {/*Small screens (e.g., mobile)*/}
            <Sheet isOpen={contactSheetState.isOpen} onClose={contactSheetState.close} className="md:hidden">
                <OverlayProvider>
                    <FocusScope contain autoFocus restoreFocus>
                        <ContactListSheet
                            contacts={contacts}
                            onSelect={handleContactClick}
                            onClose={contactSheetState.close}
                            users={users}
                            allmessage={messages}
                            handlemessage={handleSendMessage}
                        />
                    </FocusScope>
                </OverlayProvider>
            </Sheet>

            {/*Large screens (e.g., desktop)*/}
            <Sheet
                isOpen={contactSheetState.isOpen}
                onClose={contactSheetState.close}
                disableDrag={true}
                className="hidden md:block"
            >
                <OverlayProvider>
                    <FocusScope contain autoFocus restoreFocus>
                        <ContactListAndUserChatSheet
                            onSelect={handleContactClick}
                            onClose={contactSheetState.close}
                            contacts={contacts}
                            users={users}
                            allmessage={messages}
                            handlemessage={handleSendMessage}
                        />
                    </FocusScope>
                </OverlayProvider>
            </Sheet>

            {/* Chat Sheet */}
            <Sheet
                isOpen={chatSheetState.isOpen}
                onClose={() => { }}
                disableDrag={true}
                className="md:hidden"
            >
                <OverlayProvider>
                    <FocusScope contain autoFocus restoreFocus>
                        {selectedContact && (
                            <ChatSheet
                                contacts={contacts}
                                allmessage={messages}
                                onBack={() => chatSheetState.close()}
                                handlemessage={handleSendMessage} selectedContact={selectedContactData}                            />
                        )}
                    </FocusScope>
                </OverlayProvider>
            </Sheet>

            
        </div>
    );
}




