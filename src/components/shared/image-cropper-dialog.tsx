"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
    X as XIcon, 
    ArrowClockwise as ArrowClockwiseIcon, 
    ArrowCounterClockwise as ArrowCounterClockwiseIcon, 
    CornersOut as CornersOutIcon,
    Camera as CameraIcon
} from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";


interface ImageCropperDialogProps {
    isOpen: boolean;
    imageSrc: string;
    onClose: () => void;
    onCrop: (croppedFile: File) => void;
    fileName?: string;
    cropShape?: "circle" | "square" | "rect";
    cropWidth?: number;
    cropHeight?: number;
    outputWidth?: number;
    outputHeight?: number;
}

export function ImageCropperDialog({
    isOpen,
    imageSrc,
    onClose,
    onCrop,
    fileName = "cropped-image.jpg",
    cropShape = "square",
    cropWidth = 300,
    cropHeight = 300,
    outputWidth = 400,
    outputHeight = 400
}: ImageCropperDialogProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [viewportSize, setViewportSize] = useState({ width: 400, height: 400 });

    // Calculate scaling factor to fit the crop box within the viewport with some padding (e.g., 32px)
    const padding = 32;
    const maxAllowedWidth = Math.max(100, viewportSize.width - padding);
    const maxAllowedHeight = Math.max(100, viewportSize.height - padding);
    
    const scaleX = maxAllowedWidth / cropWidth;
    const scaleY = maxAllowedHeight / cropHeight;
    const uiScale = Math.min(1, scaleX, scaleY);

    const uiCropWidth = cropWidth * uiScale;
    const uiCropHeight = cropHeight * uiScale;
    
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset state when a new image is loaded or dialog is opened
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setRotation(0);
            setOffset({ x: 0, y: 0 });
        }
    }, [isOpen, imageSrc]);

    // Setup ResizeObserver to track container bounds
    useEffect(() => {
        if (!isOpen) return;
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setViewportSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });

        observer.observe(container);
        // Initial size check
        setViewportSize({
            width: container.clientWidth,
            height: container.clientHeight,
        });

        return () => observer.disconnect();
    }, [isOpen]);

    // Handle image load to set initial fitting dimensions
    const handleImageLoad = () => {
        const img = imageRef.current;
        if (!img || uiCropWidth === 0 || uiCropHeight === 0) return;

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const targetRatio = uiCropWidth / uiCropHeight;

        let width = 0;
        let height = 0;

        // Cover fit calculation to fill the UI crop box
        if (imgRatio > targetRatio) {
            height = uiCropHeight;
            width = uiCropHeight * imgRatio;
        } else {
            width = uiCropWidth;
            height = uiCropWidth / imgRatio;
        }

        setImageDimensions({ width, height });
    };

    // Recalculate dimensions if viewport size or crop bounds change
    useEffect(() => {
        if (viewportSize.width > 0 && imageRef.current) {
            handleImageLoad();
        }
    }, [viewportSize.width, viewportSize.height, uiCropWidth, uiCropHeight]);

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0]!;
        setIsDragging(true);
        setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0]!;
        setOffset({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        });
    };

    // Apply crop and generate File object
    const handleSave = () => {
        const img = imageRef.current;
        if (!img) return;

        const canvas = document.createElement("canvas");
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clean canvas
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outputWidth, outputHeight);

        // Display dimensions
        const dispWidth = imageDimensions.width;
        const dispHeight = imageDimensions.height;

        // Draw cropped region
        // We translate canvas center to origin, apply offset and rotation, and draw centered image
        const renderScale = outputWidth / uiCropWidth;
        const drawWidth = dispWidth * zoom * renderScale;
        const drawHeight = dispHeight * zoom * renderScale;
        const drawOffsetX = offset.x * renderScale;
        const drawOffsetY = offset.y * renderScale;

        ctx.translate(outputWidth / 2 + drawOffsetX, outputHeight / 2 + drawOffsetY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

        // Convert canvas to File
        canvas.toBlob((blob) => {
            if (!blob) return;
            const croppedFile = new File([blob], fileName, { type: "image/jpeg", lastModified: Date.now() });
            onCrop(croppedFile);
            onClose();
        }, "image/jpeg", 0.9);
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent 
                size={cropShape === "rect" ? "5xl" : "3xl"} 
                showCloseButton={false} 
                className="overflow-hidden md:h-[500px] h-auto max-h-[90dvh] rounded-2xl" 
                aria-describedby={undefined}
            >
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CameraIcon className="w-5 h-5 text-cuan-cyan animate-pulse" />
                        Edit Gambar
                    </DialogTitle>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    
                    {/* Viewport Area */}
                    <div 
                        ref={containerRef}
                        className="flex-1 bg-slate-950 flex items-center justify-center p-4 relative min-h-[300px] md:min-h-0 overflow-hidden select-none cursor-move"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                    >
                        {/* The Image */}
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="To Crop"
                            onLoad={handleImageLoad}
                            className="absolute pointer-events-none origin-center max-w-none"
                            style={{
                                width: imageDimensions.width ? `${imageDimensions.width}px` : "auto",
                                height: imageDimensions.height ? `${imageDimensions.height}px` : "auto",
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                transition: isDragging ? "none" : "transform 0.15s ease-out",
                                top: imageDimensions.height ? `calc(50% - ${imageDimensions.height / 2}px)` : "50%",
                                left: imageDimensions.width ? `calc(50% - ${imageDimensions.width / 2}px)` : "50%",
                            }}
                        />

                        {/* Crop Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div 
                                style={{ width: `${uiCropWidth}px`, height: `${uiCropHeight}px` }}
                                className={cn(
                                    "border-2 border-white shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]",
                                    cropShape === "circle" ? "rounded-full" : cropShape === "square" ? "rounded-2xl" : "rounded-xl"
                                )}
                            />
                        </div>
                    </div>

                    {/* Controls Sidebar */}
                    <div className="w-full md:w-[280px] p-6 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between bg-slate-50 shrink-0">
                        <div className="space-y-6">
                            
                            {/* Zoom Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <span>Zoom</span>
                                    <span>{zoom.toFixed(1)}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.2"
                                    max="3"
                                    step="0.05"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full accent-cuan-cyan cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                />
                            </div>

                            {/* Rotation Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <span>Putar</span>
                                    <span>{rotation}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    step="1"
                                    value={rotation}
                                    onChange={(e) => setRotation(parseInt(e.target.value))}
                                    className="w-full accent-cuan-cyan cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                />
                            </div>

                            {/* Preset Rotate Buttons */}
                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRotation((prev) => (prev - 90) % 360)}
                                    className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-slate-600 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <ArrowCounterClockwiseIcon className="w-4 h-4" />
                                    -90°
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                    className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-slate-600 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <ArrowClockwiseIcon className="w-4 h-4" />
                                    +90°
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setZoom(1);
                                        setRotation(0);
                                        setOffset({ x: 0, y: 0 });
                                    }}
                                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                                    title="Reset"
                                >
                                    <CornersOutIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Dialog Footer Actions */}
                        <div className="flex items-center gap-3 pt-6 border-t border-slate-200/60 mt-6 md:mt-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 font-semibold text-sm transition-colors cursor-pointer text-center"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="flex-1 py-2.5 px-4 bg-cuan-cyan hover:bg-007EA5 rounded-xl text-white font-semibold text-sm shadow-md shadow-cuan-cyan/10 hover:shadow-lg transition-all cursor-pointer text-center"
                            >
                                Terapkan
                            </button>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
