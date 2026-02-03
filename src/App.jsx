import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PHASES, ASSETS } from './constants';
import LaunchPhase from './components/LaunchPhase';
import SearchPhase from './components/SearchPhase';
import ClimaxPhase from './components/ClimaxPhase';

function App() {
  const [phase, setPhase] = useState(PHASES.LAUNCH);

  const handleLaunch = () => {
    setPhase(PHASES.SEARCH);
  };

  const handleFound = () => {
    setPhase(PHASES.CLIMAX);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black text-white relative">
      {/* ▼▼▼ ここを修正しました！ display: none を削除 ▼▼▼ */}
      <audio
        id="bgm-audio"
        src={ASSETS.MUSIC_URL}
        preload="auto"
        loop
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
      {/* ▲▲▲ 修正完了 ▲▲▲ */}

      <AnimatePresence mode="wait">
        {phase === PHASES.LAUNCH && (
          <motion.div
            key="launch"
            className="w-full h-full absolute top-0 left-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
            transition={{ duration: 1 }}
          >
            <LaunchPhase onLaunch={handleLaunch} />
          </motion.div>
        )}

        {phase === PHASES.SEARCH && (
          <motion.div
            key="search"
            className="w-full h-full absolute top-0 left-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <SearchPhase onFound={handleFound} />
          </motion.div>
        )}

        {phase === PHASES.CLIMAX && (
          <motion.div
            key="climax"
            className="w-full h-full absolute top-0 left-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <ClimaxPhase />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;