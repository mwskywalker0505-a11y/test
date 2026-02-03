import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Compass, LocateFixed } from 'lucide-react';
import { ASSETS } from '../constants';

const SearchPhase = ({ onFound }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isLocked, setIsLocked] = useState(false);
    const containerRef = useRef(null);

    // Target position (The Moon) - located at some distance from start
    // Let's say user starts at 0,0. Target is at x: -800, y: -400 (pixels of translation)
    // This means user has to pan RIGHT (move bg LEFT) and DOWN (move bg UP) to find it?
    // Wait, if I pan RIGHT (camera moves right), the background moves LEFT (negative X).
    // So if Moon is at "Right", its CSS position should be POSITIVE relative to center?
    // Let's define the World coordinates.
    // Viewport is window. 
    // Background is a huge div, e.g., 3000x3000px centered.
    // Moon is absolute positioned within that huge div.
    // We translate the huge div.

    const WORLD_SIZE = 4000;
    const MOON_POS = { x: 1200, y: -800 }; // Relative to center of World
    const MOON_SIZE = 200; // px

    // Current view offset (how much we have panned)
    // offset.x = 0 means we are looking at center.
    // offset.x = 500 means we shifted the world by -500?

    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 }); // Current pan
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const guideControls = useAnimation();

    // Gyroscope Setup
    useEffect(() => {
        let baseAlpha = null;
        let baseBeta = null;

        const handleOrientation = (event) => {
            if (isDragging.current) return; // Disable gyro if dragging

            const { alpha, beta, gamma } = event;
            // alpha: 0-360 (z-axis rotation)
            // beta: -180-180 (x-axis, front/back tilt)
            // gamma: -90-90 (y-axis, left/right tilt)

            if (alpha === null) return;

            if (baseAlpha === null) {
                baseAlpha = alpha;
                baseBeta = beta;
            }

            // Calculate delta
            // Note: handling alpha wraparound (0 <-> 360) is tricky, keeping it simple for now
            let deltaAlpha = baseAlpha - alpha;
            let deltaBeta = baseBeta - beta;

            // Simplify wraparound
            if (deltaAlpha > 180) deltaAlpha -= 360;
            if (deltaAlpha < -180) deltaAlpha += 360;

            // Map degrees to pixels. 1 degree = 15 pixels?
            const SENSITIVITY = 25;

            // Update view offset based on gyro
            // Smooth interpolation could be better, but direct mapping for responsiveness
            setViewOffset({
                x: deltaAlpha * SENSITIVITY,
                y: deltaBeta * SENSITIVITY
            });
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, []);

    // Mouse/Touch Drag Logic for PC/Fallback
    const handlePointerDown = (e) => {
        isDragging.current = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        lastMousePos.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current || isLocked) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - lastMousePos.current.x;
        const dy = clientY - lastMousePos.current.y;

        setViewOffset(prev => ({
            x: prev.x + dx, // Dragging right moves view right (so world moves right? Wait. Drag right = Pan left usually?)
            // Let's implement "Drag moves the world".
            // Use natural scrolling.
            y: prev.y + dy
        }));

        lastMousePos.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
        isDragging.current = false;
    };

    // Detection Logic & Arrow Guidance
    useEffect(() => {
        if (isLocked) return;

        // Center of viewport is effectively { x: 0, y: 0 } offset from current view.
        // The World moves by `viewOffset`.
        // Moon Position in World is `MOON_POS`.
        // Moon Screen Position = MOON_POS + viewOffset. (Assume Center is 0,0)

        // Actually, background translate is `viewOffset`.
        const moonScreenX = MOON_POS.x + viewOffset.x;
        const moonScreenY = MOON_POS.y + viewOffset.y;

        // Check if Moon is in center (distance from 0,0 is small)
        const dist = Math.sqrt(moonScreenX ** 2 + moonScreenY ** 2);

        // Update Arrow Rotation
        // Arrow should point to Moon.
        // Angle = atan2(moonScreenY, moonScreenX)
        // +90 deg because arrow icon usually points UP or RIGHT. 
        // Lucide 'Compass' points NE? 'Navigation' points Up.
        // Let's use simple CSS rotation.
        const angle = Math.atan2(moonScreenY, moonScreenX) * (180 / Math.PI);
        guideControls.start({ rotate: angle + 90 }); // Adjust +90 if arrow points UP by default

        // Lock On condition
        if (dist < 150) { // Within 150px radius
            setIsLocked(true);
            setTimeout(() => {
                onFound();
            }, 2000);
        }
    }, [viewOffset, isLocked, onFound, guideControls]); // MOON_POS is constant

    // Generate Stars
    const stars = useRef([...Array(200)].map(() => ({
        x: (Math.random() - 0.5) * WORLD_SIZE,
        y: (Math.random() - 0.5) * WORLD_SIZE,
        size: Math.random() * 3 + 1,
        opacity: Math.random(),
        delay: Math.random() * 5
    }))).current;

    return (
        <div
            className="w-full h-full overflow-hidden bg-black relative cursor-move"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
        >

            {/* HUD Overlay (Fixed) */}
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-center">
                {/* Crosshair - Explicitly Centered */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px] border border-white/20 rounded-full flex items-center justify-center">
                    <div className="w-[2px] h-[10px] bg-white/50" />
                    <div className="w-[10px] h-[2px] bg-white/50 absolute" />
                </div>
            </div>

            {/* TARGET LOCKED MESSAGE (Separate Layer) */}
            {isLocked && (
                <div
                    className="absolute z-50 flex justify-center items-center pointer-events-none"
                    style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: '-80px' }}
                >
                    <motion.div
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-red-500 border-2 border-red-500 px-4 py-2 font-mono font-bold tracking-widest bg-red-900/20 backdrop-blur-sm whitespace-nowrap"
                    >
                        TARGET LOCKED
                    </motion.div>
                </div>
            )}

            {/* Signal Meter (Separate Layer for positioning reliability) */}
            {!isLocked && (
                <div
                    className="absolute left-0 w-full flex justify-center pointer-events-none z-30"
                    style={{ bottom: '15%' }} // Explicit style to ensure it sticks to bottom
                >
                    <motion.div
                        className="opacity-80"
                        animate={guideControls}
                    >
                        <div className="flex flex-col items-center scale-150">
                            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                            <span className="text-[10px] text-cyan-300 font-mono tracking-widest font-bold bg-black/60 px-2 py-1 rounded backdrop-blur-sm whitespace-nowrap">SIGNAL DETECTED</span>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* The World Container */}
            <motion.div
                ref={containerRef}
                className="absolute left-1/2 top-1/2" // Origin at center
                style={{
                    x: viewOffset.x,
                    y: viewOffset.y,
                    transition: 'transform 0.1s cubic-bezier(0.1, 0.7, 1.0, 0.1)' // Small lag for weight
                }}
            >
                {/* Background Image Layer */}
                <div
                    className="absolute rounded-full"
                    style={{
                        left: -WORLD_SIZE / 2,
                        top: -WORLD_SIZE / 2,
                        width: WORLD_SIZE,
                        height: WORLD_SIZE,
                        zIndex: -1
                    }}
                >
                    {/* The Background Image itself - Brightened */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url(${ASSETS.SPACE_BG})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'brightness(1.8) contrast(1.2)'
                        }}
                    />

                    {/* Gradient Overlay for Environment Light */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `radial-gradient(circle at center, rgba(50, 70, 120, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%)`
                        }}
                    />
                </div>

                {/* Stars */}
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                            left: star.x,
                            top: star.y,
                            width: star.size,
                            height: star.size,
                            opacity: star.opacity,
                            boxShadow: `0 0 ${star.size * 2}px white`
                        }}
                    />
                ))}

                {/* The Moon */}
                <div
                    className="absolute rounded-full"
                    style={{
                        left: MOON_POS.x - MOON_SIZE / 2, // Center the moon at pos
                        top: MOON_POS.y - MOON_SIZE / 2,
                        width: MOON_SIZE * 1.2, // Slightly larger
                        height: MOON_SIZE * 1.2,
                        backgroundImage: `url(${ASSETS.MOON})`,
                        backgroundSize: 'cover',
                        boxShadow: `0 0 80px 20px rgba(255, 255, 255, 0.8), inset 0 0 40px rgba(0,0,0,0.5)`
                    }}
                >
                    {/* Moon Glow Ping */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-0"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>

            </motion.div>
        </div>
    );
};

export default SearchPhase;
