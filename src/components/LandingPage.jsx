import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LandingPage({ onStart }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        await onStart();
        // Only stop loading if it failed, usually onStart handles success by unmounting this
        // But if we want to be safe in case of error:
        // setLoading(false); 
    };

    return (
        <div className="landing-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="landing-content"
            >
                <h1 className="landing-title">Capture the<br /><em>Unseen</em></h1>
                <p className="landing-subtitle">
                    Nomad automatically chronicles your journey.
                    Grant access to begin your log.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary landing-btn"
                    onClick={handleClick}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loading-spinner">Capturing Moment...</span>
                    ) : "Start Journey"}
                </motion.button>

                {loading && <p className="loading-hint">Please allow permissions. Creating your first memory...</p>}
            </motion.div>
        </div>
    );
}
