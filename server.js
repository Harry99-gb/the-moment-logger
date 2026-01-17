import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware to generate a unique ID for each upload request
const requestIDMiddleware = (req, res, next) => {
    req.momentId = `moment-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    next();
};

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create a specific folder for this moment using the attached ID
        const uploadPath = path.join(uploadDir, req.momentId);

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Keep original filename or simplify
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    res.send('Nomad Backend is Running');
});

// Capture Moment Endpoint
// Add requestIDMiddleware before upload.fields
app.post('/api/moment', requestIDMiddleware, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), (req, res) => {
    try {
        console.log('Received Moment Capture:');

        const locationData = JSON.parse(req.body.location || '{}');
        console.log('📍 Location:', locationData);

        if (req.files['photo']) {
            console.log('📸 Photo Saved:', req.files['photo'][0].filename);
        }

        if (req.files['audio']) {
            console.log('🎙️ Audio Saved:', req.files['audio'][0].filename);
        }

        // Save metadata to a JSON log file inside the specific moment folder
        const metaData = {
            id: req.momentId,
            timestamp: new Date().toISOString(),
            location: locationData,
            files: {
                photo: req.files['photo'] ? req.files['photo'][0].filename : null,
                audio: req.files['audio'] ? req.files['audio'][0].filename : null
            }
        };

        const momentFolderPath = path.join(uploadDir, req.momentId);
        fs.writeFileSync(
            path.join(momentFolderPath, 'metadata.json'),
            JSON.stringify(metaData, null, 2)
        );

        // Also append to a master log if desired, but user focused on individual folders.
        fs.appendFileSync(
            path.join(uploadDir, 'master_log.json'),
            JSON.stringify({ id: req.momentId, time: metaData.timestamp }) + ',\n'
        );

        res.status(200).json({ success: true, message: 'Moment Captured Successfully' });
    } catch (error) {
        console.error('Error processing moment:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`User Backend Server running on http://localhost:${PORT}`);
});
