"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
    QrCode,
    Search,
    User,
    Sparkles,
    CheckCircle2,
    Coffee,
    ArrowRight,
    RefreshCw,
    Plus,
    Minus,
    Camera,
    CameraOff,
    DollarSign,
    Clock,
    Award
} from "lucide-react";
import {
    useLookupLoyaltyCodeQuery,
    useProcessManualPointsMutation,
} from "@/redux/features/loyalty/loyaltyApi";

export default function BaristaScanPage() {
    const [inputCode, setInputCode] = useState("");
    const [searchedCode, setSearchedCode] = useState("");
    const [pointsAmount, setPointsAmount] = useState<number>(20);
    const [txType, setTxType] = useState<"ADD" | "DEDUCT">("ADD");
    const [description, setDescription] = useState("In-Store Purchase - Counter Order");
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const scannerRef = useRef<any>(null);

    // RTK Query Hooks
    const { 
        data: lookupResponse, 
        isLoading: isLookingUp, 
        isFetching: isFetchingLookup, 
        refetch: refetchLookup,
        error: lookupError 
    } = useLookupLoyaltyCodeQuery(searchedCode, {
        skip: !searchedCode || searchedCode.length < 5,
    });

    const [processPoints, { isLoading: isProcessing }] = useProcessManualPointsMutation();

    const customerData = lookupResponse?.data;

    // Handle Manual or Hardware Scanner Search
    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const cleaned = inputCode.trim().toUpperCase();
        if (!cleaned) {
            toast.error("Please enter a customer loyalty member code or scan QR code.");
            return;
        }
        setSearchedCode(cleaned);
    };

    // Camera QR Code Scanner — native BarcodeDetector API (no npm package needed)
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animFrameRef = useRef<number | null>(null);

    const stopCamera = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (scannerRef.current) {
            (scannerRef.current as MediaStream)
                .getTracks()
                .forEach((t: MediaStreamTrack) => t.stop());
            scannerRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        if (!isCameraActive) {
            stopCamera();
            return;
        }

        // Check native BarcodeDetector support
        if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
            setScannerError("QR scanning is not supported on this browser. Please use Chrome or Edge, or type the code manually.");
            setIsCameraActive(false);
            return;
        }

        let cancelled = false;

        const startScanner = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });

                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                scannerRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                // @ts-ignore — BarcodeDetector is not yet in TS lib
                const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });

                const scan = async () => {
                    if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
                        animFrameRef.current = requestAnimationFrame(scan);
                        return;
                    }
                    try {
                        const barcodes = await detector.detect(videoRef.current);
                        if (barcodes.length > 0) {
                            const cleanCode = barcodes[0].rawValue.trim().toUpperCase();
                            setInputCode(cleanCode);
                            setSearchedCode(cleanCode);
                            toast.success(`Scanned: ${cleanCode}`);
                            setIsCameraActive(false);
                            return; // stop scanning
                        }
                    } catch {
                        // frame error — keep scanning
                    }
                    animFrameRef.current = requestAnimationFrame(scan);
                };

                animFrameRef.current = requestAnimationFrame(scan);
            } catch (err: any) {
                if (!cancelled) {
                    console.error("Camera scanner error:", err);
                    setScannerError("Camera permission denied or camera not available.");
                    setIsCameraActive(false);
                }
            }
        };

        startScanner();

        return () => {
            cancelled = true;
            stopCamera();
        };
    }, [isCameraActive, stopCamera]);

    // Handle Point Adjustment
    const handleProcessPoints = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchedCode) {
            toast.error("Please scan or look up a customer loyalty code first.");
            return;
        }

        if (pointsAmount <= 0) {
            toast.error("Please enter a valid points amount.");
            return;
        }

        try {
            const finalPoints = txType === "ADD" ? Math.abs(pointsAmount) : -Math.abs(pointsAmount);
            const res = await processPoints({
                loyaltyCode: searchedCode,
                points: finalPoints,
                reason: description.trim() || undefined,
            }).unwrap();

            const actionLabel = txType === "ADD" ? "credited to" : "deducted from";
            toast.success(`${Math.abs(finalPoints)} Points successfully ${actionLabel} ${customerData?.name || "customer"}!`);
            
            // Refetch updated balance
            refetchLookup();
            
            // Reset input values
            setPointsAmount(20);
            setDescription("In-Store Purchase - Counter Order");
        } catch (err: any) {
            console.error("Points adjustment error:", err);
            toast.error(err?.data?.message || "Failed to process points transaction.");
        }
    };

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C07C4A]/20 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Loyalty QR Counter Scanner
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#C07C4A]/20 border border-[#C07C4A]/30 text-[#C07C4A] text-[10px] font-bold uppercase tracking-widest">
                            POS Counter Mode
                        </span>
                    </div>
                    <p className="text-xs text-[#FAF6F0]/60 mt-1">
                        Scan customer loyalty QR pass or enter member code to award or redeem points on counter purchases.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setIsCameraActive(!isCameraActive);
                        setScannerError(null);
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        isCameraActive
                            ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                            : "bg-[#C07C4A] text-white shadow-lg shadow-[#C07C4A]/20 hover:bg-[#A86435]"
                    }`}
                >
                    {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                    <span>{isCameraActive ? "Close Camera" : "Open Camera Scanner"}</span>
                </button>
            </div>

            {/* Camera Viewport (when active) */}
            {isCameraActive && (
                <div className="bg-[#120805] p-6 rounded-3xl border border-[#C07C4A]/30 flex flex-col items-center justify-center space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between w-full max-w-md">
                        <span className="text-xs font-bold text-[#FAF6F0] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#C07C4A]" />
                            Point camera at customer&apos;s loyalty QR code
                        </span>
                        <button 
                            onClick={() => setIsCameraActive(false)}
                            className="text-xs text-red-400 hover:underline cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-[#C07C4A]/50 bg-black min-h-[260px] object-cover"
                        style={{ display: isCameraActive ? "block" : "none" }}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {scannerError && (
                        <p className="text-xs text-red-400 font-semibold">{scannerError}</p>
                    )}
                </div>
            )}

            {/* Top Search / Scan Bar */}
            <form onSubmit={handleSearch} className="bg-[#120805] p-4 sm:p-6 rounded-3xl border border-[#C07C4A]/20 shadow-xl space-y-3">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#FAF6F0]/60 block">
                    Loyalty Member Code or Scan Input
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <QrCode className="w-5 h-5 text-[#C07C4A] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            placeholder="e.g. CH-7821-9940 or scan barcode"
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-mono font-bold text-white placeholder-white/30 focus:outline-none focus:border-[#C07C4A] tracking-wider"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLookingUp || isFetchingLookup}
                        className="px-7 py-3.5 bg-[#C07C4A] hover:bg-[#A86435] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isLookingUp || isFetchingLookup ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                        <span>Lookup Customer</span>
                    </button>
                </div>
            </form>

            {/* Customer Details & Points Adjustment Grid */}
            {customerData ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
                    
                    {/* Left: Customer Profile Pass Card */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-[#1E0F0B] via-[#2A140E] to-[#120805] p-6 sm:p-7 rounded-3xl border border-[#C07C4A]/30 shadow-2xl space-y-6 text-left relative overflow-hidden">
                        <div className="flex justify-between items-start border-b border-white/10 pb-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#C07C4A]">Member Profile</span>
                                <h3 className="font-serif text-xl font-bold text-white leading-tight">
                                    {customerData.name || "Specialty Member"}
                                </h3>
                                <p className="text-xs text-[#FAF6F0]/60">{customerData.email}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-[#C07C4A]/20 border border-[#C07C4A]/40 text-[#FAF0ED] text-[10px] font-black uppercase tracking-wider">
                                {customerData.tier || "Bean Member"}
                            </span>
                        </div>

                        {/* Balance Stats */}
                        <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div>
                                <span className="text-[9px] font-bold text-[#FAF6F0]/50 uppercase tracking-wider block">
                                    Current Points
                                </span>
                                <span className="font-serif text-3xl font-black text-[#C07C4A] block">
                                    {customerData.pointsBalance?.toLocaleString() ?? 0}
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-[#FAF6F0]/50 uppercase tracking-wider block">
                                    Gift Card Balance
                                </span>
                                <span className="font-serif text-2xl font-black text-white block">
                                    ${Number(customerData.giftCardBalance ?? 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-2 text-xs text-[#FAF6F0]/70 border-t border-white/10 pt-4">
                            <div className="flex justify-between">
                                <span>Loyalty Code:</span>
                                <span className="font-mono font-bold text-white">{customerData.loyaltyCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Lifetime Points:</span>
                                <span className="font-bold text-[#C07C4A]">{customerData.lifetimePoints?.toLocaleString() ?? 0} pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Manual Points Entry & Redemption Form */}
                    <div className="lg:col-span-7 bg-[#120805] p-6 sm:p-7 rounded-3xl border border-[#C07C4A]/20 shadow-2xl space-y-6 text-left">
                        <div className="flex items-center justify-between border-b border-[#C07C4A]/20 pb-4">
                            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                                <Coffee className="w-5 h-5 text-[#C07C4A]" />
                                Process Counter Points
                            </h3>
                            <span className="text-xs text-[#FAF6F0]/60">Live Barista Action</span>
                        </div>

                        <form onSubmit={handleProcessPoints} className="space-y-5">
                            {/* Action Type: Add / Deduct */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#FAF6F0]/60 block">
                                    Transaction Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTxType("ADD")}
                                        className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                            txType === "ADD"
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400"
                                                : "bg-white/5 border border-white/10 text-white/70 hover:text-white"
                                        }`}
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Credit / Earn Points</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTxType("DEDUCT")}
                                        className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                            txType === "DEDUCT"
                                                ? "bg-[#C07C4A] text-white shadow-lg shadow-[#C07C4A]/30 border border-[#C07C4A]"
                                                : "bg-white/5 border border-white/10 text-white/70 hover:text-white"
                                        }`}
                                    >
                                        <Minus className="w-4 h-4" />
                                        <span>Debit / Redeem Points</span>
                                    </button>
                                </div>
                            </div>

                            {/* Amount Input and Quick Preset Buttons */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#FAF6F0]/60">
                                        Points Amount ({txType === "ADD" ? "+ Credit" : "- Deduct"})
                                    </label>
                                    <span className="text-[10px] text-[#C07C4A] font-bold">Standard rule: 1 pt per $1 spent</span>
                                </div>

                                <div className="flex gap-2">
                                    {[10, 20, 50, 100].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setPointsAmount(preset)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                pointsAmount === preset
                                                    ? "bg-[#C07C4A] text-white"
                                                    : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                                            }`}
                                        >
                                            {preset} pts
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="number"
                                    min={1}
                                    required
                                    value={pointsAmount}
                                    onChange={(e) => setPointsAmount(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-lg font-mono font-bold text-white focus:outline-none focus:border-[#C07C4A]"
                                />
                            </div>

                            {/* Note / Description */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#FAF6F0]/60 block">
                                    Order Note / Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. 2 Pour-overs, 1 Almond Croissant"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#C07C4A]"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                                    txType === "ADD"
                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40"
                                        : "bg-[#C07C4A] hover:bg-[#A86435] text-white shadow-[#C07C4A]/30"
                                }`}
                            >
                                {isProcessing ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                )}
                                <span>
                                    {isProcessing
                                        ? "Processing..."
                                        : `${txType === "ADD" ? "Award" : "Redeem"} ${pointsAmount} Points Now`}
                                </span>
                            </button>
                        </form>
                    </div>

                </div>
            ) : searchedCode ? (
                <div className="p-12 text-center bg-[#120805] rounded-3xl border border-[#C07C4A]/20 space-y-3">
                    <p className="text-sm font-semibold text-white">No customer found for code &quot;{searchedCode}&quot;.</p>
                    <p className="text-xs text-[#FAF6F0]/60">Please verify the loyalty code and try scanning again.</p>
                </div>
            ) : (
                <div className="p-12 text-center bg-[#120805]/50 rounded-3xl border border-[#C07C4A]/10 space-y-2">
                    <QrCode className="w-10 h-10 text-[#C07C4A]/40 mx-auto" />
                    <p className="text-sm font-semibold text-[#FAF6F0]/70">Ready to Scan</p>
                    <p className="text-xs text-[#FAF6F0]/40">Scan a customer QR code or type their member code above to begin.</p>
                </div>
            )}
        </div>
    );
}
