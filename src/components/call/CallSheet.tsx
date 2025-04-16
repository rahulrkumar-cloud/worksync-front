"use client";

import { PhoneIcon, VideoCameraIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Sheet } from "react-modal-sheet";

export function CallScreenSheet({
    contactName,
    callType,
    onEndCall,
}: {
    contactName: string;
    callType: "audio" | "video";
    onEndCall: () => void;
}) {
    return (
        // <Sheet.Container>
        <Sheet
            isOpen={true}
            onClose={onEndCall}
            snapPoints={[1]} // Use 1 to represent full height
            initialSnap={0}  // Set to full height initially
            disableDrag={true} // Optional: disables drag to close
        >
            <Sheet.Container className="!h-screen !max-h-screen !rounded-none !bg-[#0A142F]">
                <div className="h-full w-full text-white flex flex-col items-center justify-center gap-6">
                    {/* Header */}
                    <div className="absolute top-0 w-full p-4 flex justify-end">
                        <button
                            onClick={onEndCall}
                            className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition"
                        >
                            <XMarkIcon className="h-6 w-6 text-white" />
                        </button>
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-3xl font-semibold">
                            {contactName.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold">{contactName}</h2>
                        <p className="text-gray-400">
                            {callType === "audio" ? "Audio Calling..." : "Video Calling..."}
                        </p>
                    </div>

                    {/* Call Type Icon */}
                    <div className="mt-6">
                        {callType === "audio" ? (
                            <PhoneIcon className="h-12 w-12 text-green-500 animate-pulse" />
                        ) : (
                            <VideoCameraIcon className="h-12 w-12 text-blue-500 animate-pulse" />
                        )}
                    </div>
                </div>
            </Sheet.Container>
        </Sheet>

    );
}
