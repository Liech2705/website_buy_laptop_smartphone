import React, { useState } from 'react';
import { Power, Sun, Layers, Cpu, Radio, Shield, Palette, Wifi, Sliders, Smartphone, Laptop as LaptopIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const InteractiveShowcase3D = () => {
  // Interactive States
  const [lidAngle, setLidAngle] = useState(115); // Hinge angle: 0 (closed) to 135 (fully open)
  const [rgbColor, setRgbColor] = useState('cyan'); // cyan, pink, purple, gold
  const [wallpaper, setWallpaper] = useState('cosmos'); // cosmos, cyberpunk, aurora
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [phoneUnlocked, setPhoneUnlocked] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);

  // RGB Map
  const rgbColors = {
    cyan: { hex: '#22d3ee', shadow: 'rgba(34, 211, 238, 0.65)', bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    pink: { hex: '#f472b6', shadow: 'rgba(244, 114, 182, 0.65)', bg: 'bg-pink-500/20', text: 'text-pink-400' },
    purple: { hex: '#c084fc', shadow: 'rgba(192, 132, 252, 0.65)', bg: 'bg-purple-500/20', text: 'text-purple-400' },
    gold: { hex: '#fbbf24', shadow: 'rgba(251, 191, 36, 0.65)', bg: 'bg-amber-500/20', text: 'text-amber-400' }
  };

  // Wallpaper Map
  const wallpapers = {
    cosmos: {
      name: 'Cosmos Space',
      style: { background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)' },
      screenBg: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop'
    },
    cyberpunk: {
      name: 'Cyber Neon',
      style: { background: 'linear-gradient(135deg, #020617 0%, #581c87 50%, #db2777 100%)' },
      screenBg: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=600&auto=format&fit=crop'
    },
    aurora: {
      name: 'Aurora Borealis',
      style: { background: 'linear-gradient(135deg, #064e3b 0%, #111827 60%, #1e3a8a 100%)' },
      screenBg: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?q=80&w=600&auto=format&fit=crop'
    }
  };

  // Hotspots definitions
  const hotspots = [
    {
      id: 'screen',
      label: 'Super-Retina XDR Screen',
      desc: '120Hz ProMotion AMOLED, 2000 nits peak brightness, Gorilla Glass Armor.',
      top: '22%', left: '41%'
    },
    {
      id: 'keyboard',
      label: 'Quantum M4 Ultra Chip',
      desc: '3nm architecture. Per-key RGB mechanical switches with zero latency.',
      top: '72%', left: '33%'
    },
    {
      id: 'phone',
      label: 'Liechtop Phone 15 Pro',
      desc: 'Dynamic Mirror Back glass, 200MP LiDAR camera, 6000mAh Battery.',
      top: '76%', left: '76%'
    }
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      
      {/* 3D DEVICES STAGE */}
      <div 
        className="relative w-full h-[240px] sm:h-[300px] flex items-center justify-center overflow-visible z-10"
        style={{ perspective: '1600px' }}
      >
        
        {/* Desk Base Shadow */}
        <div className="absolute bottom-[10%] w-[85%] h-[12px] bg-black/70 rounded-full filter blur-[15px] pointer-events-none transform -rotate-x-12 translate-y-8"></div>
        
        {/* Glow ambient background based on RGB choice */}
        <div 
          className="absolute w-[60%] h-[60%] rounded-full filter blur-[120px] opacity-35 pointer-events-none transition-all duration-700 z-0"
          style={{
            background: rgbColors[rgbColor].hex,
            top: '20%',
            left: '20%'
          }}
        />

        {/* Global Device Container with Hover Mouse Parallax Angle */}
        <div 
          className="relative w-full h-full flex items-center justify-center preserve-3d transition-transform duration-700 ease-out"
          style={{
            transform: 'rotateX(62deg) rotateZ(-22deg) translateY(-20px) translateX(-10px)',
            transformStyle: 'preserve-3d'
          }}
        >
          
          {/* =============================================
              1. 3D CSS LAPTOP
              ============================================= */}
          <div 
            className="absolute preserve-3d"
            style={{
              width: '290px',
              height: '200px',
              transform: 'translate3d(-25px, -25px, 0px)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* A. KEYBOARD BASE (Lies flat on XY plane) */}
            <div 
              className="absolute inset-0 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 flex flex-col p-3 shadow-[0_15px_40px_rgba(0,0,0,0.8)] preserve-3d"
              style={{
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Keyboard keys structure */}
              <div 
                className="w-full h-[55%] rounded-lg bg-slate-950 p-1.5 flex flex-col justify-between border border-slate-800 transition-all duration-300 relative"
                style={{
                  boxShadow: isPowerOn && lidAngle > 10
                    ? `0 0 15px ${rgbColors[rgbColor].shadow}, inset 0 0 8px ${rgbColors[rgbColor].shadow}`
                    : 'none'
                }}
              >
                {/* Simulated keys rows using grid */}
                <div className="grid grid-cols-10 gap-[2px] w-full h-full opacity-90">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="rounded-[2px] bg-slate-800 border-b border-slate-700" 
                      style={{
                        boxShadow: isPowerOn && lidAngle > 10
                          ? `0 0 2px ${rgbColors[rgbColor].hex}`
                          : 'none',
                        background: isPowerOn && lidAngle > 10 ? '#0f172a' : '#1e293b'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Speaker grills on sides */}
              <div className="w-full flex justify-between px-2 my-1 text-[4px] text-slate-600 font-bold tracking-widest select-none">
                <span>:::::::::::::::::::</span>
                <span>:::::::::::::::::::</span>
              </div>

              {/* Trackpad in Center */}
              <div className="w-[90px] h-[40px] rounded-lg bg-slate-950/80 border border-slate-700/60 mx-auto mt-auto flex items-center justify-center">
                <div className="w-[80px] h-[1px] bg-slate-800/40 mt-auto"></div>
              </div>

              {/* Front Lip bevel shadow */}
              <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-slate-950 rounded-b-2xl border-t border-slate-800"></div>
            </div>

            {/* B. SCREEN LID (Rotates around Hinge at the top edge) */}
            <div 
              className="absolute preserve-3d"
              style={{
                width: '290px',
                height: '190px',
                bottom: '200px', // Hinge point
                transformOrigin: 'bottom center',
                transform: `rotateX(${-lidAngle}deg)`, // Rotate upward around bottom hinge
                transformStyle: 'preserve-3d',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* BACK OF LID (Facing camera when laptop is closed) */}
              <div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-t from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center backface-hidden shadow-[inset_0_2px_5px_rgba(255,255,255,0.1)] preserve-3d"
                style={{
                  transform: 'rotateY(180deg)', // Face outwards when closed
                }}
              >
                {/* Glowing Logo */}
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-950/80 border transition-all duration-500"
                  style={{
                    borderColor: isPowerOn ? rgbColors[rgbColor].hex : '#475569',
                    boxShadow: isPowerOn ? `0 0 15px ${rgbColors[rgbColor].shadow}` : 'none'
                  }}
                >
                  <LaptopIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* FRONT OF SCREEN DISPLAY (Facing user when laptop is open) */}
              <div 
                className="absolute inset-0 rounded-2xl bg-slate-950 border-[6px] border-slate-900 flex flex-col p-1 backface-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)] preserve-3d"
                style={{
                  boxShadow: isPowerOn && lidAngle > 15
                    ? `0 0 30px ${rgbColors[rgbColor].shadow}`
                    : 'none'
                }}
              >
                {/* Top Bezel Camera */}
                <div className="w-full flex justify-center py-0.5 z-20">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-blue-500"></div>
                  </div>
                </div>

                {/* Display Panel */}
                <div 
                  className="flex-1 w-full rounded-lg overflow-hidden relative flex flex-col justify-between p-3 border border-slate-800/50 transition-all duration-500 bg-cover bg-center"
                  style={{
                    backgroundImage: isPowerOn && lidAngle > 15 
                      ? `url(${wallpapers[wallpaper].screenBg})`
                      : 'none',
                    backgroundColor: isPowerOn && lidAngle > 15 ? 'transparent' : '#020617',
                    boxShadow: isPowerOn && lidAngle > 15 ? 'inset 0 0 40px rgba(0,0,0,0.8)' : 'none'
                  }}
                >
                  {/* Glass Gloss effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/0 to-white/10 pointer-events-none z-10" />

                  {isPowerOn && lidAngle > 15 && (
                    <>
                      {/* Top status info */}
                      <div className="flex justify-between items-center text-[8px] text-white/70 font-black tracking-widest uppercase bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded">
                        <span className="flex items-center gap-1"><Sun className="w-2.5 h-2.5 text-yellow-400" /> Liechtop OS v3</span>
                        <span className="flex items-center gap-0.5">Online <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span></span>
                      </div>

                      {/* Screen content overlay */}
                      <div className="my-auto text-center flex flex-col items-center justify-center animate-pulse">
                        <span className="text-[16px] font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                          LIECHTOP PRO
                        </span>
                        <span className="text-[7px] tracking-[0.3em] font-black text-primary-300 uppercase mt-0.5">
                          Quantum Engine
                        </span>
                      </div>

                      {/* Bottom shelf app deck */}
                      <div className="w-[85%] mx-auto flex justify-around items-center p-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 z-20">
                        <div className="w-4 h-4 rounded bg-cyan-500 flex items-center justify-center shadow"><Layers className="w-3 h-3 text-white" /></div>
                        <div className="w-4 h-4 rounded bg-purple-500 flex items-center justify-center shadow"><Cpu className="w-3 h-3 text-white" /></div>
                        <div className="w-4 h-4 rounded bg-pink-500 flex items-center justify-center shadow"><Radio className="w-3 h-3 text-white" /></div>
                        <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center shadow"><Shield className="w-3 h-3 text-white" /></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =============================================
              2. 3D CSS SMARTPHONE
              ============================================= */}
          <div 
            className="absolute cursor-pointer preserve-3d transition-transform duration-500"
            style={{
              width: '90px',
              height: '180px',
              transform: 'translate3d(160px, -20px, 12px) rotateZ(-18deg)', // Lay flat next to laptop
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Phone titanium frame base */}
            <div 
              className="absolute inset-0 rounded-[22px] bg-slate-900 border-2 border-slate-700 flex flex-col p-1 shadow-[0_12px_35px_rgba(0,0,0,0.8)] preserve-3d"
              style={{
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Screen Body */}
              <div 
                className="flex-1 w-full rounded-[18px] overflow-hidden relative flex flex-col justify-between p-2 border border-slate-800 transition-all duration-500 bg-cover bg-center"
                style={{
                  backgroundImage: isPowerOn 
                    ? `url(${wallpapers[wallpaper].screenBg})`
                    : 'none',
                  backgroundColor: isPowerOn ? 'transparent' : '#020617',
                  boxShadow: isPowerOn ? 'inset 0 0 20px rgba(0,0,0,0.8)' : 'none'
                }}
                onClick={() => setPhoneUnlocked(!phoneUnlocked)}
              >
                {/* Dynamic island bezel */}
                <div className="w-[36px] h-[9px] bg-black rounded-full mx-auto flex items-center justify-end px-1.5 z-30">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-blue-500"></div>
                  </div>
                </div>

                {isPowerOn && (
                  <>
                    {!phoneUnlocked ? (
                      /* LOCK SCREEN */
                      <div className="flex-1 flex flex-col justify-between py-3 text-center select-none pointer-events-none">
                        <div>
                          <p className="text-[12px] font-black text-white leading-none">15:40</p>
                          <p className="text-[6px] font-black text-slate-300 tracking-wider uppercase mt-1">Thứ Năm, 21 Th 5</p>
                        </div>
                        <div className="mt-auto animate-bounce flex flex-col items-center">
                          <Smartphone className="w-4 h-4 text-white/80" />
                          <span className="text-[5px] font-black uppercase text-white/50 tracking-widest mt-1.5">Click to unlock</span>
                        </div>
                      </div>
                    ) : (
                      /* HOME SCREEN (UNLOCKED) */
                      <div className="flex-1 flex flex-col justify-between pt-1 pb-1 z-20">
                        {/* Status bar */}
                        <div className="flex justify-between items-center text-[6px] text-white font-bold tracking-tight px-1.5">
                          <span>15:40</span>
                          <div className="flex items-center gap-0.5">
                            <Wifi className="w-2 h-2" />
                            <span>100%</span>
                          </div>
                        </div>

                        {/* App icon grid */}
                        <div className="grid grid-cols-3 gap-2 p-1.5 my-auto">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="aspect-square rounded-lg flex flex-col items-center justify-center shadow-md bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.success(`Mở App giả lập #${i + 1}!`);
                              }}
                            >
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: Object.values(rgbColors)[i % 4].hex }}></div>
                              <span className="text-[5px] font-bold text-white uppercase mt-0.5 tracking-tighter">App {i + 1}</span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom dock bar */}
                        <div className="w-[85%] mx-auto flex justify-around items-center p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5">
                          <div className="w-3 h-3 rounded bg-green-500" />
                          <div className="w-3 h-3 rounded bg-blue-500" />
                          <div className="w-3 h-3 rounded bg-red-500" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* =============================================
              3. INTERACTIVE HOTSPOTS (Positioned in 3D Space)
              ============================================= */}
          {hotspots.map((hs) => (
            <div 
              key={hs.id}
              className="absolute z-40 preserve-3d"
              style={{
                top: hs.top,
                left: hs.left,
                transform: 'translateZ(25px) rotateX(-60deg) rotateY(10deg)', // Face towards camera projection
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Glowing Pulse Circle */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(activeHotspot === hs.id ? null : hs.id);
                }}
                className="relative w-6 h-6 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-white text-[10px] font-black hover:scale-110 active:scale-95 transition-all shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              >
                <span className="absolute inset-0 w-full h-full rounded-full border-2 border-primary-500 animate-ping opacity-60"></span>
                +
              </button>

              {/* Popover Bubble */}
              {activeHotspot === hs.id && (
                <div 
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] text-left select-text animate-[fadeIn_0.2s_ease-out] z-50 pointer-events-auto"
                  style={{ transform: 'translateZ(10px)' }}
                >
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-primary-400" /> {hs.label}
                  </h4>
                  <p className="text-[8px] text-slate-400 font-bold leading-normal italic">{hs.desc}</p>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* =============================================
          4. DIGITAL CONTROL CENTER (Bottom Glass Dashboard)
          ============================================= */}
      <div className="w-full bg-slate-950/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4 relative z-20">
        
        {/* Header Title */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4.5 h-4.5 text-primary-400" />
            <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.25em] text-white">Digital Control Center</span>
          </div>
          <button 
            onClick={() => setIsPowerOn(!isPowerOn)}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              isPowerOn 
                ? 'border-red-500/50 bg-red-950/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)] hover:bg-red-500 hover:text-white' 
                : 'border-green-500/50 bg-green-950/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:bg-green-500 hover:text-white'
            }`}
          >
            <Power className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Dynamic Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          
          {/* A. Lid Angle Range Slider */}
          <div className="flex flex-col gap-2.5 sm:col-span-5">
            <span className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>Bản lề Laptop</span>
              <span className="text-primary-400">{lidAngle}°</span>
            </span>
            <input 
              type="range" 
              min="0" 
              max="135" 
              value={lidAngle} 
              disabled={!isPowerOn}
              onChange={(e) => setLidAngle(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-40"
            />
            <span className="text-[8px] text-slate-500 font-bold italic tracking-wide">
              {lidAngle === 0 ? 'Đã gập hoàn toàn (Sleep)' : lidAngle > 105 ? 'Góc mở tối ưu' : 'Đang mở'}
            </span>
          </div>

          {/* B. RGB Backlit Selector */}
          <div className="flex flex-col gap-2.5 sm:col-span-3">
            <span className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-slate-500" /> LED Bàn phím
            </span>
            <div className="flex gap-2.5 flex-wrap">
              {Object.keys(rgbColors).map((colorKey) => (
                <button
                  key={colorKey}
                  onClick={() => setRgbColor(colorKey)}
                  disabled={!isPowerOn || lidAngle === 0}
                  className={`w-7 h-7 rounded-full border transition-all hover:scale-105 active:scale-95 disabled:opacity-30 ${
                    rgbColor === colorKey ? 'border-white scale-110 ring-2 ring-white/10' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: rgbColors[colorKey].hex }}
                />
              ))}
            </div>
          </div>

          {/* C. Wallpaper Selector */}
          <div className="flex flex-col gap-2.5 sm:col-span-4">
            <span className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Chủ đề Không gian
            </span>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(wallpapers).map((wallKey) => (
                <button
                  key={wallKey}
                  onClick={() => setWallpaper(wallKey)}
                  disabled={!isPowerOn}
                  className={`flex-1 min-w-[65px] py-2 px-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${
                    wallpaper === wallKey 
                      ? 'border-primary-500 bg-primary-950/30 text-primary-400 shadow-[0_0_10px_rgba(99,102,241,0.25)]' 
                      : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {wallKey}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default InteractiveShowcase3D;
