import { useCallback } from 'react';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim'; // lightweight
import { ASSETS } from '../constants';

const ClimaxPhase = () => {
    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden bg-black flex flex-col items-center justify-center">

            {/* Meteor Shower Background */}
            <Particles
                id="tsparticles"
                init={particlesInit}
                className="absolute inset-0 z-0"
                options={{
                    fullScreen: { enable: false },
                    fpsLimit: 60,
                    particles: {
                        color: { value: "#ffffff" },
                        move: {
                            direction: "bottom-left",
                            enable: true,
                            outModes: { default: "out" },
                            random: false,
                            speed: 10, // Fast metaors
                            straight: true,
                        },
                        number: {
                            density: { enable: true, area: 800 },
                            value: 200,
                        },
                        opacity: {
                            value: 0.8,
                            random: false,
                            anim: {
                                enable: false,
                            }
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 0.1, max: 2 },
                        },
                        // Trail effect for meteors
                        trail: {
                            enable: true,
                            length: 10,
                            fillColor: "#000000"
                        }
                    },
                    detectRetina: true,
                }}
            />

            {/* The Moon (Zoomed in) */}
            <motion.div
                className="absolute z-10 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 3, ease: "easeOut" }}
                style={{
                    width: '300px',
                    height: '300px',
                    backgroundImage: `url(${ASSETS.MOON})`,
                    backgroundSize: 'cover',
                    boxShadow: `0 0 100px 20px rgba(50, 100, 255, 0.4)`
                }}
            />

            {/* Message Text */}
            <div className="z-20 text-center mix-blend-screen px-4">
                <motion.h1
                    className="text-3xl md:text-5xl font-serif text-white mb-8 tracking-widest leading-loose"
                    style={{
                        textShadow: '0 0 20px rgba(255,255,255,0.8)',
                        fontFamily: '"Noto Serif JP", serif'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3, duration: 2 }}
                >
                    俺を見つけてくれてありがとう
                </motion.h1>
                <motion.p
                    className="text-xl md:text-3xl font-serif text-white tracking-widest"
                    style={{
                        textShadow: '0 0 15px rgba(255,255,255,0.6)',
                        fontFamily: '"Noto Serif JP", serif'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 5.5, duration: 2 }}
                >
                    好きです
                </motion.p>
            </div>
        </div>
    );
};

export default ClimaxPhase;
