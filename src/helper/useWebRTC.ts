import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Change to your backend URL if needed

export const useWebRTC = (userId: string) => {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);

  const setupMedia = async () => {
    try {
      console.log("🎥 Requesting user media...");
      console.log("🎥 Attempting to access user media...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("✅ Got user media:", stream);
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("✅ Got local stream");
      return localStream.current;
    } catch (err:any) {
      console.error("❌ Failed to get user media:", err.name, "-", err.message);
    if (err.name === "NotReadableError") {
      console.warn("⚠️ Camera/mic might be in use by another application.");
    }
      return null;
    }
  };

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate && remoteSocketIdRef.current) {
        console.log("📤 Sending ICE candidate to", remoteSocketIdRef.current);
        socket.emit("ice-candidate", {
          to: remoteSocketIdRef.current,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      console.log("📥 Received remote track");
      remoteStream.current = e.streams[0];
    };

    return peer;
  };

  useEffect(() => {
    console.log("📡 Registering user with socket:", userId);
    socket.emit("register", userId);

    socket.on("incoming-call", async ({ from, offer }) => {
      console.log("📞 Incoming call from", from);
      remoteSocketIdRef.current = from;
      peerRef.current = createPeerConnection();

      const stream = await setupMedia();
      if (!stream) return;
      stream.getTracks().forEach((track) => {
        peerRef.current?.addTrack(track, stream);
      });

      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: from,
        answer,
      });
      console.log("✅ Sent answer to call");
    });

    socket.on("call-answered", async ({ from, answer }) => {
      console.log("📞 Call answered by", from);
      await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("📥 Received ICE candidate");
      try {
        await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("❌ Error adding ICE candidate:", err);
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
    };
  }, [userId]);

  const callUser = async (targetUserId: string) => {
    console.log("📞 Calling user", targetUserId);
    remoteSocketIdRef.current = targetUserId;
    peerRef.current = createPeerConnection();

    const stream = await setupMedia();
    if (!stream) {
      console.warn("🚫 No local stream available to start call");
      return;
    }
    stream.getTracks().forEach((track) => {
      peerRef.current?.addTrack(track, stream);
    });

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socket.emit("call-user", {
      to: targetUserId,
      offer,
    });

    console.log("📤 Sent offer to", targetUserId);
  };

  return {
    callUser,
    localStream,
    remoteStream,
  };
};
