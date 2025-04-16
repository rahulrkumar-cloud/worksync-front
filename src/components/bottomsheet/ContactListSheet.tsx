import { useRef, useState } from "react";
import { useButton, useDialog, useModal, useOverlay } from "react-aria";
import { Sheet } from "react-modal-sheet";
import { ChatSheet } from "./ChatSheet";
import { useRouter } from "next/navigation";

interface Contact {
    id: number;
    name: string;
    messages: string[];
}

export function ContactListSheet({
    onSelect,
    onClose, users, allmessage, handlemessage
}: {
    onSelect: (contact: Contact) => void;
    onClose: () => void;
    users: any;
    allmessage: any
    handlemessage: any;
}) {
    const containerRef = useRef(null);
    const dialog = useDialog({}, containerRef);
    const overlay = useOverlay({ onClose, isOpen: true, isDismissable: true }, containerRef);
    const closeButtonRef = useRef(null);
    const closeButton = useButton({ onPress: onClose }, closeButtonRef);

    const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const router = useRouter();
    useModal();

    console.log("closeButton", closeButton)

    const handleContactSelect = (contact: Contact) => {
        console.log("contactcontact", contact)
        setSelectedContactId(Number(contact?.id));
        setSelectedContact(contact);
        // setSelectedUser(contact?.id)
        onSelect(contact); // Propagate selection if necessary
    };
    console.log("selectedContactselectedContact", selectedContact)


    return (

        <>
            {/* <Sheet.Container> */}
            <Sheet.Container className="fixed inset-0 z-50">
                <div
                    {...overlay.overlayProps}
                    {...dialog.dialogProps}
                    ref={containerRef}
                    className="focus:outline-none h-full rounded-t-2xl bg-white dark:bg-[#0A142F] flex flex-col"
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-[#0A142F] dark:text-white">Contacts</h2>
                        <button
                            onClick={() => router.push("/")}
                            // onClick={onClose}
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
                            Back
                        </button>
                    </div>

                    <div className="overflow-y-auto px-4 py-2 flex-1">
                        {(users ?? []).map((contact: any) => (
                            <div
                                key={contact.id}
                                className="flex items-center gap-4 p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
                                onClick={() => handleContactSelect(contact)}
                            >
                                {/* <div className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold">
                                    {contact.name[0]}
                                </div> */}
                                {/* Avatar */}
                                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    {contact.name.charAt(0).toUpperCase()}
                                    {/* Online dot */}
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                                </div>
                                {/* <div className="text-base font-medium text-gray-800 dark:text-gray-100">
                                    {contact.name}
                                </div> */}
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-base">
                                            {contact.name}
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
                            </div>
                        ))}
                    </div>
                </div>
            </Sheet.Container>
        </>
    );
}