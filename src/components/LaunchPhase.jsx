import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Fingerprint } from 'lucide-react';

const LaunchPhase = ({ onLaunch }) => {
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false); // 準備完了フラグ
    const controls = useAnimation();
    const intervalRef = useRef(null);

    // ジャイロ許可リクエスト (iOS用)
    const requestGyroPermission = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    console.log('Gyroscope permission granted');
                }
            } catch (e) {
                console.error('Error requesting gyroscope permission:', e);
            }
        }
    };

    // 音声再生トリガー
    const playAudio = () => {
        const audio = document.getElementById('bgm-audio');
        if (audio) {
            audio.volume = 1.0;
            audio.muted = false;
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
    };

    // ▼ チャージ開始（長押し）
    const handleStart = () => {
        if (isReady) return; // 完了してたら何もしない

        controls.start({ scale: 0.95 });
        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(intervalRef.current);
                    setIsReady(true); // 100%になったら準備完了モードへ！
                    return 100;
                }
                return prev + 2; // チャージ速度
            });
        }, 30);
    };

    // ▼ 指を離したとき（チャージ中断）
    const handleEnd = () => {
        if (isReady) return; // 準備完了してたらリセットしない！

        clearInterval(intervalRef.current);
        controls.start({ scale: 1 });
        setProgress(0); // 失敗したら0に戻る
    };

    // ▼▼▼ ここが最重要！発射ボタンのクリック処理 ▼▼▼
    const handleLaunchClick = () => {
        if (!isReady) return;

        // ユーザーのタップ直後にこれを実行することでブロックを回避
        playAudio();
        requestGyroPermission();

        onLaunch(); // 画面遷移
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-black/40 backdrop-blur-sm relative z-10">
            {/* 中央のボタンエリア */}
            <div className="relative">
                {/* 外側の円リング */}
                <svg className="w-64 h-64 transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        className="text-blue-900/30"
                    />
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                        className={`transition-all duration-100 ease-linear ${isReady ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'text-cyan-500'}`}
                    />
                </svg>

                {/* 指紋認証ボタン（インタラクティブエリア） */}
                <motion.div
                    className="absolute top-0 left-0 w-64 h-64 rounded-full flex items-center justify-center cursor-pointer"
                    animate={controls}
                    // ▼ イベントハンドラの切り替え
                    onPointerDown={handleStart}
                    onPointerUp={handleEnd}
                    onPointerLeave={handleEnd}
                    onClick={isReady ? handleLaunchClick : undefined} // 準備完了時のみクリック有効
                >
                    <div
                        className={`w-56 h-56 rounded-full flex items-center justify-center transition-all duration-500 border-2 
                        ${isReady
                                ? 'bg-green-500/20 border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.5)] animate-pulse'
                                : 'bg-blue-900/40 border-cyan-500/30'}`}
                    >
                        {isReady ? (
                            // 完了時の表示
                            <span className="text-2xl font-bold text-green-300 tracking-widest animate-pulse">
                                LAUNCH
                            </span>
                        ) : (
                            // チャージ中の表示
                            <Fingerprint
                                size={80}
                                className={`transition-colors duration-300 ${progress > 0 ? 'text-cyan-300' : 'text-blue-500/50'}`}
                            />
                        )}
                    </div>
                </motion.div>
            </div>

            {/* 下部のテキスト指示 */}
            <p className={`mt-12 text-sm font-mono tracking-[0.2em] transition-all duration-300 ${isReady ? 'text-green-400 font-bold' : 'text-blue-400'}`}>
                {isReady ? "TAP TO LAUNCH SYSTEM" : "HOLD TO CHARGE"}
            </p>
        </div>
    );
};

export default LaunchPhase;