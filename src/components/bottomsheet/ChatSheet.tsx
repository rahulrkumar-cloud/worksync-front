import { useAuth } from "@/context/TokenProvider";
import { Message, User } from "@/src/interface/chatinterface";
import { ArrowLeftIcon, PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { Avatar } from "@nextui-org/react";
import { useRef, useState } from "react";
import { useButton, useDialog, useModal, useOverlay } from "react-aria";
import { Sheet } from "react-modal-sheet";

interface Contact {
    id: number;
    name: string;
    messages: string[];
}
export function ChatSheet({
    selectedContact, contacts,
    onBack,
    handlemessage, allmessage,
}: {
    selectedContact: any;
    onBack: () => void;
    handlemessage: any;
    allmessage: any
    contacts: any;

}) {
    const containerRef = useRef(null);
    const dialog = useDialog({}, containerRef);
    const overlay = useOverlay({ onClose: () => { }, isOpen: true, isDismissable: false }, containerRef);
    const [message, setMessage] = useState("");
    const [selectedContactId, setSelectedContactId] = useState<number | null>(null);


    const handleSendMessage = () => {
        if (message.trim()) {
            console.log("Message Sent:", message);
            setSelectedContactId(Number(selectedContact?.id));
            handlemessage(message, selectedContactId)
            setMessage("");
        }
    };
    console.log("selectedContact", allmessage)

    return (
        <Sheet.Container>
            <div
                {...overlay.overlayProps}
                {...dialog.dialogProps}
                ref={containerRef}
                className="focus:outline-none h-[99vh] rounded-t-2xl bg-white dark:bg-[#0A142F] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-1 text-center">
                        {selectedContact.name}
                    </h2>
                    <div className="flex gap-3">
                        <button
                            className="p-2 bg-green-500 hover:bg-green-600 rounded-full"
                            onClick={() => console.log("Audio call")}
                        >
                            <PhoneIcon className="w-5 h-5 text-white" />
                        </button>
                        <button
                            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full"
                            onClick={() => console.log("Video call")}
                        >
                            <VideoCameraIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                    {(allmessage[selectedContact?.id] ?? []).map((msg: any, i: number) => {
                        const isCurrentUser = msg.senderId !== String(selectedContact.id); // You can change this logic depending on your actual senderId
                        return (
                            <div
                                key={i}
                                className={`px-4 py-2 rounded-lg max-w-[75%] ${isCurrentUser
                                    ? "bg-green-100 dark:bg-green-800 self-end ml-auto"
                                    : "bg-gray-200 dark:bg-gray-700 self-start"
                                    }`}
                            >
                                {msg.text}
                                <div className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">
                                    {msg.currenttime}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A142F] flex items-center gap-2">
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault(); // Prevents newline or form submission
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type a message"
                        className="flex-1 p-3 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <button
                        onClick={handleSendMessage}
                        className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l14-9-4 9 4 9-14-9z" />
                        </svg>
                    </button>
                </div>
            </div>
        </Sheet.Container>

    );
}
