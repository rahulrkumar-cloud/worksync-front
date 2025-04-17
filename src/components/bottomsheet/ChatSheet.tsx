import { useAuth } from "@/context/TokenProvider";
import { Message, User } from "@/src/interface/chatinterface";
import { ArrowLeftIcon, PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { Avatar } from "@nextui-org/react";
import { useRef, useState } from "react";
import { useButton, useDialog, useModal, useOverlay } from "react-aria";
import { Sheet } from "react-modal-sheet";
import { CallScreenSheet } from "../call/CallSheet";
import { useWebRTC } from "@/src/helper/useWebRTC";

interface Contact {
    id: number;
    name: string;
    messages: string[];
}
export function ChatSheet({
    selectedContact,
    onBack,
    handlemessage, allmessage,userId
}: {
    selectedContact: any;
    onBack: () => void;
    handlemessage: any;
    allmessage: any;
    userId: any

}) {
    const containerRef = useRef(null);
    const dialog = useDialog({}, containerRef);
    const overlay = useOverlay({ onClose: () => { }, isOpen: true, isDismissable: false }, containerRef);
    const [message, setMessage] = useState("");
    const [showCallScreen, setShowCallScreen] = useState(false);
    const [callType, setCallType] = useState<"audio" | "video" | null>(null);
    const { callUser, localStream, remoteStream } = useWebRTC(userId);

    const handleSendMessage = () => {
        if (message.trim()) {
            console.log("Message Sent:", message);
            handlemessage(message, Number(selectedContact?.id))
            setMessage("");
        }
    };
    console.log("userIduserIduserId", userId)
    const isActiveNow = true;
    return (
        // <Sheet.Container>
        <Sheet.Container className="fixed inset-0 z-50">
            <div
                className="h-full flex flex-col bg-white dark:bg-[#0A142F] rounded-t-2xl"
                {...overlay.overlayProps}
                {...dialog.dialogProps}
                ref={containerRef}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    {/* Back Button + User Info */}
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Avatar */}
                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white font-semibold flex items-center justify-center text-lg shadow-lg transition-transform duration-300">
                            {selectedContact?.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Name + Status */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                    {selectedContact ? selectedContact.name : "Select a user to start chatting"}
                                </h2>
                            </div>

                            {selectedContact && (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                                    {isActiveNow && <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />}
                                    {isActiveNow ? "Active now" : "Last seen recently"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Call Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (selectedContact) {
                                    callUser(String(selectedContact.id)); // initiate the call
                                    setCallType("audio");
                                    setShowCallScreen(true);
                                }
                            }}
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                            <PhoneIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                        </button>
                        <button
                            onClick={() => {
                                if (selectedContact) {
                                    callUser(String(selectedContact.id));
                                    setCallType("video");
                                    setShowCallScreen(true);
                                }
                            }}
                            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                            <VideoCameraIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                    {(allmessage[selectedContact?.id] ?? []).map((msg: any, i: number) => {
                        const isCurrentUser = msg.senderId !== String(selectedContact.id);
                        return (
                            <div
                                key={i}
                                className={`px-4 py-2 rounded-lg max-w-[75%] break-words whitespace-pre-wrap ${isCurrentUser
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

                {/* Input Fixed at Bottom */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                // e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type a message"
                        className="flex-1 p-3 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700"
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
            {showCallScreen && selectedContact && (
                <CallScreenSheet
                    contactName={selectedContact.name}
                    callType={callType as "audio" | "video"}
                    onEndCall={() => {
                        setShowCallScreen(false);
                        setCallType(null);
                    }}
                    localStream={localStream}
                    remoteStream={remoteStream}
                />
            )}
        </Sheet.Container>


    );
}
