import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CameraInterface({ initialStream }) {
    const videoRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (videoRef.current && initialStream) {
            videoRef.current.srcObject = initialStream;
        }
    }, [initialStream]);

    // This component now behaves like the original requested "Main App"
    // User can manually Capture again if they want.

    return (
        <div className="postcard">
            <header className="header">
                <h1 className="logo">Nomad.</h1>
                <div className="status-bar">
                    <StatusDot active={true} tooltip="GPS Active" />
                    <StatusDot active={true} tooltip="MIC Active" />
                    <StatusDot active={true} tooltip="CAM Active" />
                </div>
            </header>

            <main className="viewfinder-container">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Overlays */}
                <AnimatePresence>
                    {isRecording && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="recording-indicator"
                        >
                            <div className="red-dot"></div>
                            <span>REC</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="controls">
                <button
                    disabled={true}
                    className="btn-primary"
                    style={{ opacity: 0.8, cursor: 'default' }}
                >
                    <span className="btn-text">Live Camera Feed</span>
                </button>
            </footer>
        </div>
    );
}

const StatusDot = ({ active, tooltip }) => (
    <div className={`status-dot ${active ? 'active' : ''}`} title={tooltip}></div>
);
