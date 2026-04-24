"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { CameraIcon, LoaderIcon, CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CheckInCardProps {
  roomId: string;
  onSuccess?: () => void;
  alreadyCheckedIn?: boolean;
}

export const CheckInCard = ({ roomId, onSuccess, alreadyCheckedIn = false }: CheckInCardProps) => {
  const trpc = useTRPC();
  const markPresence = useMutation(trpc.presence.markPresence.mutationOptions({
    onSuccess: () => {
      toast.success("Attendance marked successfully!");
      if (onSuccess) onSuccess();
    },
    onError: (e) => toast.error(e.message),
  }));

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please check permissions.");
    } finally {
      setCameraLoading(false);
    }
  };

  // Fix: Ensure video ref is sync'd when stream changes or component rerenders
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Ensure video is ready
      if (video.readyState !== 4) {
        toast.error("Camera is still warming up. Please wait.");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85); 
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleSubmit = () => {
    if (!photo) {
      toast.error("Please capture a photo first!");
      return;
    }

    const now = new Date();
    const status = now.getHours() >= 10 ? "late" : "present";

    markPresence.mutate({
      roomId,
      photoUrl: photo,
      location: undefined, // Location removed as requested
      status,
    });
  };

  if (alreadyCheckedIn) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/30 overflow-hidden">
        <CardContent className="pt-6 pb-6 text-center">
          <div className="mx-auto size-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2Icon className="size-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-emerald-900">Checked In!</h3>
          <p className="text-sm text-emerald-700 mt-1">You have already submitted your presence for today.</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-emerald-600/70">
            <span>{format(new Date(), "h:mm a")}</span>
            <span className="opacity-30">•</span>
            <span>{format(new Date(), "EEEE, MMMM d")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 overflow-hidden bg-white">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <CameraIcon className="size-5 text-primary" />
          Daily Check-in
        </CardTitle>
        <CardDescription>
          Capture a live photo and verify your presence to stay accountable.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6">
          {/* Camera / Photo Area */}
          <div className="relative aspect-video rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center group">
            {photo ? (
              <div className="relative w-full h-full animate-in fade-in zoom-in duration-300">
                <Image src={photo} alt="Session capture" fill className="object-cover" unoptimized />
                <Button 
                   variant="secondary" 
                   size="sm" 
                   className="absolute top-4 right-4 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" 
                   onClick={() => { setPhoto(null); startCamera(); }}
                >
                  Retake
                </Button>
              </div>
            ) : stream ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <div className="p-4 rounded-full bg-slate-200/50">
                   <CameraIcon className="size-10 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 max-w-[240px]">
                  Take a selfie for attendance verification. 
                  Live capture is required.
                </p>
                <Button variant="outline" onClick={startCamera} disabled={cameraLoading}>
                  {cameraLoading ? <LoaderIcon className="size-4 animate-spin mr-2" /> : null}
                  Enable Camera
                </Button>
              </div>
            )}
            
            {stream && !photo && (
               <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                  <Button 
                    size="lg" 
                    className="rounded-full h-14 w-14 p-0 shadow-xl border-4 border-white transition-transform active:scale-90"
                    onClick={capturePhoto}
                  >
                     <div className="size-6 rounded-full bg-white animate-pulse" />
                  </Button>
               </div>
            )}
          </div>

          <div className="flex flex-col gap-1 items-center justify-center py-4 bg-slate-50 border rounded-xl border-dashed">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
               Verified Time
            </span>
            <span className="text-2xl font-black text-slate-700">{format(new Date(), "h:mm a")}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{format(new Date(), "EEEE, MMMM d")}</span>
          </div>

          <Button 
            className="w-full h-12 text-base font-bold shadow-lg"
            disabled={!photo || markPresence.isPending}
            onClick={handleSubmit}
          >
            {markPresence.isPending ? <LoaderIcon className="size-5 animate-spin mr-2" /> : null}
            Submit Presence
          </Button>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </CardContent>
    </Card>
  );
};
