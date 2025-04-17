
// import { useWebRTC } from "@/src/helper/useWebRTC";
// import { PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
// import clsx from "clsx";
// import { useRouter } from "next/navigation";
// import { useRef, useState, useEffect } from "react";
// import { useButton, useDialog, useModal, useOverlay } from "react-aria";
// import { Sheet } from "react-modal-sheet";
// // import { useWebRTC } from "@/hooks/useWebRTC"; // Update the path if needed

// interface Contact {
//   id: number;
//   name: string;
//   messages: string[];
// }

// export function ContactListAndUserChatSheet({
//   onSelect,
//   onClose,
//   users,
//   allmessage,
//   handlemessage,
//   userId,
// }: {
//   onSelect: (contact: Contact) => void;
//   onClose: () => void;
//   users: any;
//   allmessage: any;
//   handlemessage: any;
//   userId: any;
// }) {
//   const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
//   const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
//   const [message, setMessage] = useState("");

//   const containerRef = useRef(null);
//   const closeButtonRef = useRef(null);

//   const dialog = useDialog({}, containerRef);
//   const overlay = useOverlay({ isOpen: true, isDismissable: true }, containerRef);
//   useModal();
//   const router = useRouter();

//   const { callUser, localStream, remoteStream } = useWebRTC(userId);

//   const handleSendMessage = () => {
//     if (message.trim()) {
//       handlemessage(message, selectedContactId);
//       setMessage("");
//     }
//   };

//   const handleContactSelect = (contact: Contact) => {
//     setSelectedContactId(Number(contact?.id));
//     setSelectedContact(contact);
//     onSelect(contact);
//   };

//   const isActiveNow = true;

//   return (
//     <Sheet.Container>
//       <div
//         {...overlay.overlayProps}
//         {...dialog.dialogProps}
//         ref={containerRef}
//         className="focus:outline-none h-[99vh] rounded-t-2xl bg-white dark:bg-[#0A142F] flex flex-col md:flex-row text-gray-800 dark:text-gray-100"
//       >
//         {/* Left Panel – Contact List */}
//         <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
//           <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
//             <h2 className="text-xl font-semibold text-[#0A142F] dark:text-white">Contacts</h2>
//             <button
//               onClick={() => router.push("/")}
//               className="flex items-center gap-2 text-white bg-[#0A142F] hover:bg-[#1c2a57] px-4 py-2 rounded-full transition-all"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//               </svg>
//               Home
//             </button>
//           </div>

//           <div className="overflow-y-auto px-4 py-2 flex-1 space-y-2">
//             {(users ?? []).map((contact: any) => {
//               const isSelected = Number(contact.id) === selectedContactId;
//               return (
//                 <div
//                   key={contact.id}
//                   onClick={() => handleContactSelect(contact)}
//                   className={clsx(
//                     "group relative flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900",
//                     {
//                       "bg-primary/10 hover:bg-primary/20 text-primary": isSelected,
//                       "dark:bg-primary/20 dark:hover:bg-primary/30": isSelected,
//                       "bg-zinc-50/80 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70": !isSelected,
//                     }
//                   )}
//                 >
//                   <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white font-semibold flex items-center justify-center text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
//                     {contact.name.charAt(0).toUpperCase()}
//                     <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
//                   </div>

//                   <div className="flex flex-col flex-1">
//                     <div className="flex items-center justify-between">
//                       <span className={clsx("font-medium text-base", {
//                         "text-primary": isSelected,
//                         "text-zinc-900 dark:text-zinc-100": !isSelected,
//                       })}>
//                         {contact.name}
//                       </span>
//                       <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full shadow-sm">3</span>
//                     </div>
//                     <span className="text-sm text-zinc-500 dark:text-zinc-400">Active recently</span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Right Panel – Chat Section */}
//         <div className="hidden md:flex w-2/3 flex-col">
//           {selectedContact ? (
//             <>
//               {/* Header */}
//               <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
//                 <div className="flex items-center gap-3">
//                   <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white font-semibold flex items-center justify-center text-lg shadow-lg">
//                     {selectedContact?.name.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="flex flex-col">
//                     <div className="flex items-center gap-2">
//                       <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
//                         {selectedContact?.name}
//                       </h2>
//                     </div>
//                     <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
//                       {isActiveNow && (
//                         <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
//                       )}
//                       {isActiveNow ? "Active now" : "Last seen recently"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Call buttons */}
//                 <div className="flex gap-3">
//                   <button
//                     className="p-3 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 backdrop-blur-sm"
//                     onClick={() => {
//                       console.log("🎧 Initiating AUDIO call to", selectedContactId);
//                       if (selectedContactId) {
//                         callUser(String(selectedContactId));
//                       } else {
//                         console.warn("❗No contact selected for audio call");
//                       }
//                     }}
//                   >
//                     <PhoneIcon className="w-5 h-5 text-white" />
//                   </button>

//                   <button
//                     className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 backdrop-blur-sm"
//                     onClick={() => {
//                       console.log("📹 Initiating VIDEO call to", selectedContactId);
//                       if (selectedContactId) {
//                         callUser(String(selectedContactId));
//                       } else {
//                         console.warn("❗No contact selected for video call");
//                       }
//                     }}
//                   >
//                     <VideoCameraIcon className="w-5 h-5 text-white" />
//                   </button>
//                 </div>
//               </div>

//               {/* Messages */}
//               <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
//                 {(allmessage[selectedContact?.id] ?? []).map((msg: any, i: number) => {
//                   const isCurrentUser = msg.senderId !== String(selectedContact.id);
//                   return (
//                     <div
//                       key={i}
//                       className={`px-4 py-2 rounded-lg max-w-[75%] break-words whitespace-pre-wrap ${isCurrentUser
//                         ? "bg-green-100 dark:bg-green-800 self-end ml-auto"
//                         : "bg-gray-200 dark:bg-gray-700 self-start"
//                         }`}
//                     >
//                       {msg.text}
//                       <div className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">
//                         {msg.currenttime}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Video Preview */}
//               <div className="flex gap-4 px-4 pb-4">
//                 <video
//                   ref={(video) => {
//                     if (video && localStream.current) {
//                       video.srcObject = localStream.current;
//                       console.log("🎥 Attached local stream to video element");
//                     }
//                   }}
//                   autoPlay
//                   muted
//                   playsInline
//                   className="w-1/2 rounded shadow-lg"
//                 />

//                 <video
//                   ref={(video) => {
//                     if (video && remoteStream.current) {
//                       video.srcObject = remoteStream.current;
//                       console.log("🎥 Attached remote stream to video element");
//                     }
//                   }}
//                   autoPlay
//                   playsInline
//                   className="w-1/2 rounded shadow-lg"
//                 />

//               </div>

//               {/* Message Input */}
//               <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A142F] flex items-center gap-2 mb-8">
//                 <input
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       handleSendMessage();
//                     }
//                   }}
//                   placeholder="Type a message"
//                   className="flex-1 p-3 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
//                 />
//                 <button
//                   onClick={handleSendMessage}
//                   className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l14-9-4 9 4 9-14-9z" />
//                   </svg>
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
//               Select a contact to start chatting
//             </div>
//           )}
//         </div>
//       </div>
//     </Sheet.Container>
//   );
// }

import { PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { Avatar } from "@nextui-org/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
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
export function ContactListAndUserChatSheet({
    onSelect,
    onClose,
    users,
    allmessage,
    handlemessage, userId
}: {
    onSelect: (contact: Contact) => void;
    onClose: () => void;
    users: any;
    allmessage: any;
    handlemessage: any;
    userId: any
}) {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const containerRef = useRef(null);
    const dialog = useDialog({}, containerRef);
    const overlay = useOverlay({ isOpen: true, isDismissable: true }, containerRef);
    const closeButtonRef = useRef(null);
    const closeButton = useButton({ onPress: onClose }, closeButtonRef);
    const [message, setMessage] = useState("");
    const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
    const router = useRouter();

    const [showCallScreen, setShowCallScreen] = useState(false);
    const [callType, setCallType] = useState<"audio" | "video" | null>(null);
    const { callUser, localStream, remoteStream } = useWebRTC(userId);

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
        console.log("contactcontactcontact", Number(contact?.id), contact, users)
        setSelectedContactId(Number(contact?.id));
        setSelectedContact(contact);
        // setSelectedUser(contact?.id)
        onSelect(contact); // Propagate selection if necessary
    };
    console.log("selectedContactId", typeof selectedContactId, selectedContactId)
    const isActiveNow = true;
    return (
        // <Sheet.Container>
        <Sheet.Container className="fixed inset-0 z-50">
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
                            onClick={() => router.push("/")}
                            // {...closeButton.buttonProps}
                            // ref={closeButtonRef}
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

                    <div className="overflow-y-auto px-4 py-2 flex-1 space-y-2">
                        {(users ?? []).map((contact: any) => {
                            const isSelected = Number(contact.id) === selectedContactId;
                            console.log("1234", contact.id)
                            console.log("isSelected", isSelected, contact.id, selectedContactId, typeof selectedContactId, typeof contact.id)
                            return (
                                <div
                                    key={contact.id}
                                    // className="flex items-center gap-4 p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
                                    onClick={() => handleContactSelect(contact)}
                                    className={clsx(
                                        "group relative flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-100 dark:focus:ring-offset-zinc-900",
                                        {
                                            // Light mode selected background
                                            "bg-primary/10 hover:bg-primary/20 text-primary": isSelected,
                                            // Dark mode selected background
                                            "dark:bg-primary/20 dark:hover:bg-primary/30": isSelected,
                                            // Non-selected
                                            "bg-zinc-50/80 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70": !isSelected,
                                        }
                                    )}
                                >
                                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white font-semibold flex items-center justify-center text-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                                        {contact.name.charAt(0).toUpperCase()}
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                                    </div>

                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={clsx("font-medium text-base", {
                                                    "text-primary": isSelected,
                                                    "text-zinc-900 dark:text-zinc-100": !isSelected,
                                                })}
                                            >
                                                {contact.name}
                                            </span>

                                            {/* Optional unread badge */}
                                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                                                3
                                            </span>
                                        </div>
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Active recently
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                </div>

                {/* Right Panel – Chat Section (Visible only on md+ screens) */}
                <div className="hidden md:flex w-2/3 flex-col">
                    {selectedContact ? (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className='flex items-center justify-between gap-3'>
                                    {/* <Avatar showFallback name={selectedContact.name[0]} src="https://images.unsplash.com/broken" /> */}
                                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white font-semibold flex items-center justify-center text-lg shadow-lg transition-transform duration-300">
                                        {selectedContact?.name.charAt(0).toUpperCase()}
                                    </div>
                                    {/* <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-1 text-start">
                                        {selectedContact?.name || "Select a Contact"}
                                    </h2> */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                                {selectedContact
                                                    ? `${selectedContact.name}`
                                                    : "Select a user to start chatting"}
                                            </h2>
                                        </div>

                                        {selectedContact && (
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                                                {isActiveNow && (
                                                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block animate-pulse" />
                                                )}
                                                {isActiveNow ? "Active now" : "Last seen recently"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        className="p-3 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 backdrop-blur-sm"
                                        onClick={() => {
                                            if (selectedContact) {
                                                callUser(String(selectedContact.id)); // initiate the call
                                                setCallType("audio");
                                                setShowCallScreen(true);
                                            }
                                        }}
                                    >
                                        <PhoneIcon className="w-5 h-5 text-white" />
                                    </button>

                                    <button
                                        className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 backdrop-blur-sm"
                                        onClick={() => {
                                            if (selectedContact) {
                                                callUser(String(selectedContact.id));
                                                setCallType("video");
                                                setShowCallScreen(true);
                                            }
                                        }}
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
