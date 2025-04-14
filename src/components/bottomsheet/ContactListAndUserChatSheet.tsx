import { PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { Avatar } from "@nextui-org/react";
import { useRef, useState } from "react";
import { useButton, useDialog, useModal, useOverlay } from "react-aria";
import { Sheet } from "react-modal-sheet";

interface Contact {
    id: number;
    name: string;
    messages: string[];
}
export function ContactListAndUserChatSheet({
    contacts,
    onSelect,
    onClose,
    users,
    allmessage,
    handlemessage
}: {
    contacts: Contact[];
    onSelect: (contact: Contact) => void;
    onClose: () => void;
    users: any;
    allmessage: any;
    handlemessage: any
}) {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const containerRef = useRef(null);
    const dialog = useDialog({}, containerRef);
    const overlay = useOverlay({ isOpen: true, isDismissable: true }, containerRef);
    const closeButtonRef = useRef(null);
    const closeButton = useButton({ onPress: onClose }, closeButtonRef);
    const [message, setMessage] = useState("");
    const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
    useModal();

    const handleSendMessage = () => {
        if (message.trim()) {
            console.log("Message Sent:", message);
            handlemessage(message, selectedContactId)
            setMessage("");
        }
    };

    // Handle contact selection
    const handleContactSelect = (contact: Contact) => {
        console.log("contact", contact)
        setSelectedContactId(Number(contact?.id));
        setSelectedContact(contact);
        // setSelectedUser(contact?.id)
        onSelect(contact); // Propagate selection if necessary
    };
    console.log("selectedContactId", typeof selectedContactId, selectedContactId)

    return (
        <Sheet.Container>
            <div
                {...overlay.overlayProps}
                {...dialog.dialogProps}
                ref={containerRef}
                className="focus:outline-none h-[99vh] rounded-t-2xl bg-white dark:bg-[#0A142F] flex flex-col md:flex-row text-gray-800 dark:text-gray-100"
            >
                {/* Left Panel – Contact List */}
                <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-[#0A142F] dark:text-white">Contacts</h2>
                        <button
                            {...closeButton.buttonProps}
                            ref={closeButtonRef}
                            className="flex items-center gap-2 text-white bg-[#0A142F] hover:bg-[#1c2a57] px-4 py-2 rounded-full transition-all"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Home
                        </button>
                    </div>

                    <div className="overflow-y-auto px-4 py-2 flex-1">
                        {(users ?? []).map((contact: any) => (
                            <div
                                key={contact.id}
                                className="flex items-center gap-4 p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
                                onClick={() => handleContactSelect(contact)}
                            >
                                <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold">
                                    {contact.name[0]}
                                </div>
                                <div className="text-base font-medium text-gray-800 dark:text-gray-100">
                                    {contact.name}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Right Panel – Chat Section (Visible only on md+ screens) */}
                <div className="hidden md:flex w-2/3 flex-col">
                    {selectedContact ? (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className='flex items-center justify-between gap-3'>
                                    <Avatar showFallback name={selectedContact.name[0]} src="https://images.unsplash.com/broken" />
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-1 text-start">
                                        {selectedContact?.name || "Select a Contact"}
                                    </h2>
                                </div>

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


                            {/* Input */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A142F] flex items-center gap-2 mb-8">
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
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            Select a contact to start chatting
                        </div>
                    )}
                </div>
            </div>

        </Sheet.Container>
    );
}