# 🌍 Nomad: The Moment Logger

**Nomad** is a minimalist traveler's application designed to capture memories effortlessly. It chronicles your journey by automatically bundling a photo, ambient audio, and GPS coordinates into a unique "moment" folder the moment you start your journey.

## ✨ Features

- **Stealth Capture**: Automatically takes a snapshot and records a 5-second audio clip immediately after sensor permissions are granted.
- **Location Tagging**: Captures precise GPS coordinates using the Geolocation API.
- **Premium Aesthetics**: A "Postcard" inspired design system with smooth Framer Motion animations and a creamy minimalist palette.
- **Organized Storage**: Every capture is stored in its own unique folder on the backend, complete with metadata logs.
- **Live Viewfinder**: Transitions into a live camera preview after the initial "ghost capture" is safely stored.

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI component architecture.
- **Vite**: Ultra-fast build tool and development server.
- **Framer Motion**: For fluid, beautiful transitions and landing page animations.
- **Media APIs**: Specialized usage of `navigator.mediaDevices`, `MediaRecorder`, and `Canvas API`.

### Backend
- **Node.js & Express**: Lightweight API server.
- **Multer**: Multi-part form data handling for file uploads (Photo + Audio).
- **Filesystem (fs)**: Hierarchical folder-based storage system.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Harry99-gb/the-moment-logger.git
   cd the-moment-logger
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running the App

To run both the **Frontend (Vite)** and the **Backend (Node Server)** concurrently:

```bash
npm start
```

- **Frontend**: `http://localhost:5173` (or the next available port)
- **Backend API**: `http://localhost:3000`

## 📁 Project Structure

```text
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx     # Premium entry point
│   │   └── CameraInterface.jsx # Post-capture live feed
│   ├── utils/
│   │   └── GhostCapture.jsx    # Core logic for background sensors
│   ├── App.jsx                 # Main state and navigation logic
│   ├── main.jsx                # Entry point
│   └── index.css               # Design system & responsive styles
├── uploads/                    # Stores grouped moments (ignored by git)
├── server.js                   # Node.js backend & Multer config
├── vite.config.js              # Vite config with API proxy
└── README.md                   # You are here!
```

## 📸 How it Works

1. **Permission Grant**: When the user clicks "Start Journey," the browser requests Location, Camera, and Microphone access.
2. **Instant Logging**: Once allowed, the `GhostCapture` utility triggers:
   - A high-res photo snapshot from the video stream.
   - 5 seconds of background audio recording.
   - Precise GPS coordinates retrieval.
3. **Backend Grouping**: Data is posted to `/api/moment`. The server creates a unique directory (e.g., `moment-176866.../`) and saves all assets + a `metadata.json` inside it.
4. **Active Session**: The UI unlocks, providing the traveler with an active viewfinder for their journey.

## 📄 License
This project is open-source and available under the MIT License.
