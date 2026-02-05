import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { LocateFixed } from 'lucide-react';
import { ASSETS } from '../constants';

const SearchPhase = ({ onFound }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [angle, setAngle] = useState(0);
    const [distance, setDistance] = useState(0);
    const [isFound, setIsFound] = useState(false);

    // ジャイロの基準点
    const baseOrientation = useRef({ alpha: null, beta: null, gamma: null });

    // Moon Position logic
    // We want the moon to be "UP" from the start position.
    // In screen coords (where background moves opposite), 
    // if we want moon at (0, -300) in the WORLD, 
    // and we start at (0,0), then we need to pan DOWN (tilt back) to bring the moon down into view?
    // Wait. If moon is at y=-300 (above), we need to look UP.
    // Looking UP usually means lowering the background (increasing Y). 
    // Let's stick to standard behavior:
    // Moon at {x:0, y:-400}.
    const MOON_POS = { x: 0, y: -400 };
    const MOON_SIZE = 150;

    useEffect(() => {
        const handleOrientation = (e) => {
            const { alpha, beta, gamma } = e;
            if (alpha === null) return;

            if (baseOrientation.current.alpha === null) {
                baseOrientation.current = { alpha, beta, gamma };
                return;
            }

            // Sensitivity
            const SENSITIVITY = 40;

            // Calculate delta from start
            // beta is front/back tilt (-180 to 180). Positive is tilting forward (looking down). 
            // gamma is left/right tilt (-90 to 90). Positive is tilting right.

            // If I tilt UP (negative beta change), deltaY should go positive (to move bg down)?
            // Let's assume standard mapping:
            let deltaX = (gamma - baseOrientation.current.gamma) * SENSITIVITY;
            let deltaY = (beta - baseOrientation.current.beta) * SENSITIVITY;

            // Clamp World
            const MAX_RANGE = 2000;
            if (deltaX > MAX_RANGE) deltaX = MAX_RANGE;
            if (deltaX < -MAX_RANGE) deltaX = -MAX_RANGE;
            if (deltaY > MAX_RANGE) deltaY = MAX_RANGE;
            if (deltaY < -MAX_RANGE) deltaY = -MAX_RANGE;

            setPosition({ x: deltaX, y: deltaY });

            // Calculate Angle & Distance to Moon
            // The "Center of View" in World Coordinates is effectively `position`.
            // Moon is at `MOON_POS`.
            // Vector to Moon = MOON_POS - position.
            const vecX = MOON_POS.x - deltaX;
            const vecY = MOON_POS.y - deltaY;

            const dist = Math.sqrt(vecX * vecX + vecY * vecY);
            setDistance(dist);

            // Angle for Arrow
            // atan2(y, x) gives angle from X axis.
            const ang = Math.atan2(vecY, vecX) * 180 / Math.PI;
            setAngle(ang + 90); // Adjust for arrow icon orientation
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, []);

    const handleMoonClick = () => {
        if (isFound) return;
        setIsFound(true);
        // Play sound or effect here if needed
        setTimeout(onFound, 1000);
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-black touch-none">
            {/* World Container - Centered */}
            <motion.div
                className="absolute left-1/2 top-1/2" // Origin at screen center
                style={{
                    x: -position.x,
                    y: -position.y
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 40, damping: 20 }}
            >
                {/* Huge Background Wrapper (4000x4000 centered on Origin) */}
                <div
                    className="absolute"
                    style={{
                        width: '4000px',
                        height: '4000px',
                        left: '-2000px',
                        top: '-2000px',
                        backgroundColor: '#020617'
                    }}
                >
                    <img
                        src={ASSETS.SPACE_BG}
                        className="w-full h-full object-cover opacity-80"
                        style={{ filter: 'brightness(1.5) contrast(1.2)' }}
                        alt="bg"
                    />

                    {/* Grid for reference */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '100px 100px'
                    }} />
                </div>

                {/* The Moon - Positioned relative to Origin */}
                <div
                    className="absolute rounded-full cursor-pointer"
                    onClick={handleMoonClick}
                    onTouchStart={handleMoonClick}
                    style={{
                        // Coordinates relative to Origin (0,0)
                        // If Moon is at MOON_POS (e.g. 0, -400) relative to origin
                        left: MOON_POS.x - MOON_SIZE / 2,
                        top: MOON_POS.y - MOON_SIZE / 2,
                        width: MOON_SIZE,
                        height: MOON_SIZE,
                        zIndex: 20
                    }}
                >
                    <div
                        className="w-full h-full rounded-full"
                        style={{
                            backgroundImage: `url(${ASSETS.MOON})`,
                            backgroundSize: 'cover',
                            boxShadow: '0 0 100px 40px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(0,0,0,0.5)'
                        }}
                    />
                    {/* Ping */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping" />
                </div>
            </motion.div>


            {/* HUD Overlay - FIXED ON SCREEN */}
            <div className="fixed inset-0 pointer-events-none z-50 translate-z-0">
                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60">
                    <div className="w-[60px] h-[60px] border border-cyan-400/50 rounded-full flex items-center justify-center">
                        <div className="w-[1px] h-[10px] bg-cyan-400/80" />
                        <div className="w-[10px] h-[1px] bg-cyan-400/80 absolute" />
                    </div>
                </div>

                {/* Guide Arrow Container - Centered */}
                {distance > 250 && (
                    <div
                        className="absolute top-1/2 left-1/2 flex items-center justify-center"
                        style={{ width: 0, height: 0, overflow: 'visible' }} // Ensure center origin
                    >
                        <motion.div
                            className="text-cyan-400 flex flex-col items-center justify-center origin-bottom"
                            style={{
                                height: '140px', // Orbit radius
                                transformOrigin: 'bottom center', // Rotate from bottom (screen center)
                                position: 'absolute',
                                bottom: '0', // Anchor bottom to center
                                display: 'flex',
                                alignItems: 'flex-start' // Put icon at top of height
                            }}
                            animate={{ rotate: angle }}
                        >
                            <div className="flex flex-col items-center transform -translate-y-full">
                                <LocateFixed size={48} strokeWidth={2} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                <div className="text-[10px] font-bold mt-1 bg-black/60 px-1 py-0.5 rounded text-cyan-200 tracking-widest uppercase whitespace-nowrap">
                                    SIGNAL DETECTED
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Bottom Status - Fixed */}
            <div className="absolute bottom-10 w-full text-center pointer-events-none z-50">
                <p className="text-cyan-400/90 font-mono text-sm tracking-[0.3em] font-bold drop-shadow-md">
                    SCANNING SECTOR
                </p>
                <div className="text-cyan-900/60 text-[10px] mt-1 font-mono flex justify-center gap-4">
                    <span>X: {Math.floor(position.x)}</span>
                    <span>Y: {Math.floor(position.y)}</span>
                    <span>DIST: {Math.floor(distance)}</span>
                </div>
            </div>
        </div>
    );
};