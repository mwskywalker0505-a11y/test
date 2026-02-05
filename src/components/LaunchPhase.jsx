import { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Fingerprint } from 'lucide-react';

const LaunchPhase = ({ onLaunch }) => {
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const controls = useAnimation();
    const intervalRef = useRef(null);

    // ジャイロ許可 (iOS)
    const requestGyroPermission = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                await DeviceOrientationEvent.requestPermission();
            } catch (e) {
                console.error('Gyro error:', e);
            }
        }
    };

    // 音声再生
    const playAudio = () => {
        const audio = document.getElementById('bgm-audio');
        if (audio) {
            audio.volume = 1.0;
            audio.muted = false;
            audio.play().catch(e => console.error("Audio failed:", e));
        }
    };

    // チャージ開始
    const handleStart = () => {
        if (isReady) return;
        controls.start({ scale: 0.9 });
        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(intervalRef.current);
                    setIsReady(true);
                    return 100;
                }
                return prev + 4; // チャージ速度少しアップ
            });
        }, 20);
    };

    // 指を離した時
    const handleEnd = () => {
        if (isReady) return;
        clearInterval(intervalRef.current);
        controls.start({ scale: 1 });
        setProgress(0);
    };

    // 発射！
    const handleLaunchClick = () => {
        if (!isReady) return;
        playAudio();
        requestGyroPermission();
        onLaunch();
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-black relative z-10 overflow-hidden">
            {/* Sci-Fi HUD Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* 1. Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* 2. Corners */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg" />

                {/* 3. Side Bars */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-32 bg-cyan-900/40" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-32 bg-cyan-900/40" />

                {/* 4. Scanner Line */}
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-scan" style={{ animationDuration: '3s' }} />

                {/* 5. Status Text */}
                <div className="absolute top-8 left-8 font-mono text-[10px] text-cyan-700 space-y-1">
                    <p>SYS.VER.2.0.4</p>
                    <p>MEM: OK</p>
                    <p>NET: SECURE</p>
                </div>
            </div>

            {/* Glowing Center for Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />

            {/* メインの円形UI（Gridで完全に中央配置） */}
            <div className="relative grid place-items-center w-80 h-80 z-20">
                {/* 1. 外側のメーターリング */}
                <svg className="absolute w-full h-full transform -rotate-90 pointer-events-none">
                    <circle cx="50%" cy="50%" r="140" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                    <circle
                        cx="50%" cy="50%" r="140"
                        stroke={isReady ? "#4ade80" : "#06b6d4"} // 緑 vs 水色
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 140}
                        strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-100 ease-linear"
                        style={{ filter: isReady ? 'drop-shadow(0 0 10px #4ade80)' : 'none' }}
                    />
                </svg>

                {/* 2. 中央のボタン */}
                <motion.div
                    className="z-20 w-60 h-60 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                    animate={controls}
                    onPointerDown={handleStart}
                    onPointerUp={handleEnd}
                    onPointerLeave={handleEnd}
                    onClick={isReady ? handleLaunchClick : undefined}
                    style={{
                        background: isReady
                            ? 'radial-gradient(circle, rgba(74,222,128,0.3) 0%, rgba(0,0,0,0) 70%)'
                            : 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(0,0,0,0) 70%)',
                        border: isReady ? '2px solid #4ade80' : '1px solid #06b6d4',
                        boxShadow: isReady ? '0 0 30px rgba(74,222,128,0.4)' : 'none'
                    }}
                >
                    {isReady ? (
                        <div className="text-center animate-pulse">
                            <p className="text-3xl font-black text-green-400 tracking-widest">TAP</p>
                            <p className="text-sm font-bold text-green-300 tracking-widest">TO LAUNCH</p>
                        </div>
                    ) : (
                        <Fingerprint
                            size={100}
                            className={`transition-colors duration-300 ${progress > 0 ? 'text-cyan-300' : 'text-slate-600'}`}
                        />
                    )}
                </motion.div>
            </div>

            {/* 下部のテキスト */}
            <p className={`mt-10 font-mono tracking-[0.3em] text-sm transition-colors duration-300 ${isReady ? 'text-green-500 font-bold' : 'text-slate-500'}`}>
                {isReady ? "SYSTEM READY" : "HOLD TO CHARGE"}
            </p>
        </div>
    );
};

export default LaunchPhase;