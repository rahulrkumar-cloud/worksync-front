"use client";

import { useEffect, useRef } from "react";
import { PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { Button } from "@nextui-org/react";
import { Sheet } from "react-modal-sheet";

export function CallScreenSheet({
    contactName,
    callType,
    onEndCall,
    localStream,
    remoteStream,
}: {
    contactName: string;
    callType: "audio" | "video";
    onEndCall: () => void;
    localStream: React.MutableRefObject<MediaStream | null>;
    remoteStream: React.MutableRefObject<MediaStream | null>;
}) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream.current) {
            localVideoRef.current.srcObject = localStream.current;
        }
        if (remoteVideoRef.current && remoteStream.current) {
            remoteVideoRef.current.srcObject = remoteStream.current;
        }
    }, [localStream.current, remoteStream.current]);

    return (
        <Sheet isOpen={true} onClose={onEndCall} snapPoints={[1]} initialSnap={0} disableDrag>
            <Sheet.Container className="!h-screen !max-h-screen !rounded-none !bg-[#0A142F]">
                <div className="h-full w-full text-white flex flex-col items-center justify-center gap-6 relative">
                    {/* End Call Button */}
                    <div className="absolute top-6 right-6">
                        <Button
                            onPress={onEndCall}
                            className="p-2 rounded-3xl bg-red-600 hover:bg-red-500 transition"
                        >
                            End call
                        </Button>
                    </div>

                    {/* Display Name + Info */}
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-3xl font-semibold">
                            {contactName.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold">{contactName}</h2>
                        <p className="text-gray-400">
                            {callType === "audio" ? "Audio Calling..." : "Video Calling..."}
                        </p>
                    </div>

                    {/* Streams */}
                    {callType === "video" ? (
                        <div className="relative w-full h-[60vh] flex justify-center items-center">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover rounded-xl"
                            />
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="absolute bottom-4 right-4 w-32 h-32 rounded-lg shadow-md border border-white"
                            />
                        </div>
                    ) : (
                        <PhoneIcon className="h-12 w-12 text-green-500 animate-pulse mt-8" />
                    )}
                </div>
            </Sheet.Container>
        </Sheet>
    );
}
