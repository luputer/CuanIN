import React from "react";

interface LaptopMockupProps {
  children: React.ReactNode;
  className?: string;
}

export function LaptopMockup({ children, className = "" }: LaptopMockupProps) {
  return (
    <div className={`web-container relative w-full ${className}`}>
      {/* Browser Frame */}
      <div className="border-[1px] border-slate-900 shadow-[2px_2px_0px_#000] rounded-lg bg-white overflow-hidden relative">
        {/* Fake Browser Toolbar */}
        <div className="border-b-[3px] border-[#506CBF] bg-slate-100 p-2 flex gap-1.5 items-center">
          <div className="w-3 h-3 rounded-full bg-red-400 border border-black"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div>
          <div className="w-3 h-3 rounded-full bg-green-400 border border-black"></div>
        </div>

        {/* Screen Content */}
        <div className="relative">
          {children}

          {/* Overlay Text */}
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/30">
            <div className="bg-yellow-200 border-2 border-black p-4 shadow-[4px_4px_0px_#000] text-slate-800 font-bold text-xl md:text-2xl text-center transform -rotate-2">
              “Ubah Keahlian Jadi Penghasilan”
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
