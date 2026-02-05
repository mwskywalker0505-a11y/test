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
            {/* World Container - Centered on Screen */}
            <motion.div
                className="absolute left-1/2 top-1/2"
                style={{
                    x: -position.x, // Move world opposite to camera movement
                    y: -position.y
                }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
            >
                {/* Huge Background */}
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
                        className="w-full h-full object-cover opacity-60"
                        style={{ filter: 'brightness(2.0) contrast(1.2)' }}
                        alt="bg"
                    />
                    {/* Grid Overlay for depth */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />
                </div>

                {/* The Moon */}
                <div
                    className="absolute rounded-full cursor-pointer"
                    onClick={handleMoonClick}
                    onTouchStart={handleMoonClick}
                    style={{
                        left: 2000 + MOON_POS.x - MOON_SIZE / 2, // 2000 is center offset
                        top: 2000 + MOON_POS.y - MOON_SIZE / 2,
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
                            boxShadow: '0 0 80px 30px rgba(255, 255, 255, 0.9)'
                        }}
                    />
                    {/* Ping Animation */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping" />
                </div>
            </motion.div>


            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none z-50">
                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60">
                    <div className="w-[60px] h-[60px] border border-cyan-400/50 rounded-full flex items-center justify-center">
                        <div className="w-[1px] h-[10px] bg-cyan-400/80" />
                        <div className="w-[10px] h-[1px] bg-cyan-400/80 absolute" />
                    </div>
                </div>

                {/* Guide Arrow - ALWAYS SHOW if distance > 200 */}
                {distance > 250 && (
                    <motion.div
                        className="absolute top-1/2 left-1/2 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        style={{
                            marginLeft: '-24px', // Half width of icon
                            marginTop: '-120px', // Radius of orbit
                            transformOrigin: '50% 120px' // Center of rotation
                        }}
                        animate={{ rotate: angle }}
                    >
                        <LocateFixed size={48} strokeWidth={2} />
                        <div className="text-[10px] text-center font-bold mt-1 tracking-widest bg-black/50 backdrop-blur-sm">SIGNAL</div>
                    </motion.div>
                )}

                {/* Target Locked Warning */}
                {distance < 250 && !isFound && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20">
                        <p className="text-red-500 font-bold tracking-[0.2em] animate-pulse bg-black/50 px-2">TARGET DETECTED</p>
                    </div>
                )}
            </div>

            {/* Bottom Status */}
            <div className="absolute bottom-12 w-full text-center pointer-events-none">
                <p className="text-cyan-500/80 font-mono text-xs tracking-[0.3em]">
                    SCANNING LOCAL SECTOR...
                </p>
                <p className="text-cyan-900/50 text-[10px] mt-1 font-mono">
                    COORDS: {Math.floor(position.x)} : {Math.floor(position.y)}
                </p>
            </div>
        </div>
    );
};

export default SearchPhase;