# 🚀 Code Sprint – Code, Compile, and Collaborate in Real-Time

A powerful real-time collaborative coding platform supporting 7+ languages with integrated terminal, file management, and persistent data storage. Designed for seamless team collaboration with all execution handled in dedicated containers.

> Visit the live preview [Code Sprint](https://code-sprint.khaftab.me) to experience the platform in action.

---

## 🌟 Features

### 👥 Real-Time Collaboration

-   Live multi-user editing with active cursor tracking
-   Room-based sessions with shareable URLs
-   Presence indicators showing who's online

### 🛠️ Integrated Development Tools

-   **📁 Advanced File Manager**
    -   Create, rename, delete, and organize files and folders (including nested directories)
    -   Download the entire project as a `.zip` archive
-   **🖥️ Dedicated Terminal**
    -   Full Linux shell access per room
    -   Real-time sync with the code editor
    -   Execute code inside isolated containers
-   **📝 Customizable Editor**
    -   Syntax highlighting for 7+ programming languages
    -   Multiple themes and font preferences
    -   Auto-suggestions for supported languages
    -   Copilot support for enhanced coding experience
-   **💬 Built-in Communication**
    -   Real-time chat for seamless collaboration
    -   Drawing canvas for sketching ideas and diagrams

### 🔁 Intelligent Synchronization

-   Bi-directional syncing between terminal and editor
-   File system watchers for detecting external changes
-   Smart container lifecycle management
    -   Containers are destroyed after 45 minutes of inactivity
    -   Uses a pool of active containers to minimize startup time for new rooms.

---

## 🏗️ System Architecture

### 🎛️ Controller Server

-   **Core Coordination**:
    -   Manages room lifecycle and user sessions
    -   Routes communication between clients
    -   Orchestrates runner container allocation

### 🧪 Runner Containers

-   **Per-Room Isolation**:
    -   Dedicated container per collaboration room
    -   Full Linux environment with terminal access
    -   Direct WebSocket communication with the client

### 🖥️ Client Interface

-   **Smart Client Communication**:
    -   Connects to the Controller Server to join a room
    -   Receives and connects to the assigned Runner Container via WebSocket
    -   Real-time code editor and terminal stay synchronized with the container

> 📦 For detailed architecture, visit the [Code Sprint Backend Repository](https://github.com/khaftab/code-sprint-backend){:target="\_blank"}

---

## 🛠️ Tech Stack

**Frontend**:

-   ⚛️ React + TypeScript
-   🧠 CodeMirror (Code editor)
-   💻 XTerm.js (Terminal emulator)
-   🎨 Tailwind CSS

**Backend**:

-   🟢 Node.js + Express
-   🔌 Socket.IO for real-time communication
-   🐳 Docker Engine API for container management

---

## ⚙️ Getting Started

### 🔧 Prerequisites

-   **Node.js** v18+
-   **npm** v9+
-   **Docker Engine** (running locally or remotely)

---

### 🚦 Setup Instructions

> ⚠️ **Important**: You must set up the backend server **before** running the frontend.

#### 1. Clone & Set Up Backend

Go to the backend repository and follow the setup instructions:
👉 [Code Sprint Backend Repository](https://github.com/khaftab/code-sprint-backend)

Make sure the backend server is running and accessible.

#### 2. Clone & Set Up Frontend

```bash
# Clone the frontend repo
git clone https://github.com/khaftab/code-sprint-frontend.git
cd code-sprint-frontend

# Install dependencies
npm install

# Setup environment variables
# Replace <server_url> with your actual backend URL (e.g., http://localhost:3000)
echo "VITE_BACKEND_URL=<server_url>" > .env

# Start the development server
npm run dev
```

---

### 🔮 Future Enhancements

-   **📦 Smarter Container Management**: Replace single-VM setup with Kubernetes or similar for scaling.
-   **🌐 Expose Web Servers**: Allow users to access web servers running inside containers directly from their browser.
-   **🧰 Framework Support:**: Enable previewing few JS frameworks (e.g., React, Vue).

### 🙏 Acknowledgements

This project's frontend is originally by Sahil Atahar, with significant modifications and additional features.
