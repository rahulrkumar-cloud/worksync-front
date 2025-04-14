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
            <Sheet.Container>
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
            </Sheet.Container>
        </>
    );
}