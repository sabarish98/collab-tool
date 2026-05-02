# CollabMaxx 🚀

> **never stop collaborating**

CollabMaxx is a professional-grade, collaborative project management tool inspired by Trello and JIRA. Built for high-performance teams, it offers a seamless Kanban experience with real-time synchronization, advanced task tracking, and team-based access control.

---

## ✨ Key Features

### 📋 Advanced Kanban Boards
- **Dynamic Workflows**: Create multiple lists and organize tasks with a fluid drag-and-drop interface powered by `@hello-pangea/dnd`.
- **JIRA-Style Tickets**: Rich task cards featuring:
  - **Status Management**: Track progress with statuses like `Open`, `In Progress`, `In Review`, `Done`, and `Blocked`.
  - **Priority Levels**: Categorize urgency from `Low` to `Critical`.
  - **Custom Labels**: Color-coded tags for `Bug`, `Feature`, `Enhancement`, `Docs`, and more.
  - **Temporal Tracking**: Set Start and Due dates to keep projects on schedule.
  - **Multi-Assignee**: Assign tasks to multiple team members with avatar representation.

### 👥 Team Collaboration
- **Team-Based Access**: Organize work into teams with dedicated boards.
- **Role Management**: Support for `Manager` and `Member` roles to control board modifications.
- **Real-time Sync**: Instant updates across all clients using Google Firestore.
- **Interactive Comments**: Threaded discussions on every task card to centralize communication.
- **Activity Feed**: Stay updated on the latest changes and project evolution.

### 🎨 Premium UI/UX
- **Modern Dark Theme**: A sleek, high-contrast interface designed for focus and reduced eye strain.
- **Micro-Animations**: Smooth transitions and interactive elements for a premium feel.
- **Responsive Design**: Optimized for various screen sizes, from desktops to mobile devices.
- **Interactive Landing Page**: A professional entry point showcasing the tool's value proposition.

---

## 🛠 Tech Stack

- **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Real-time Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Firebase Project](https://console.firebase.google.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/collab-tool.git
   cd collab-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗 Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run preview`: Locally previews the production build.
- `npm run test`: Executes unit and integration tests using Vitest.

---

## 🐳 Docker Deployment

The project includes a `Dockerfile` and `nginx.conf` for containerized deployment.

1. **Build the image**
   ```bash
   docker build -t collab-tool .
   ```

2. **Run the container**
   ```bash
   docker run -p 80:80 collab-tool
   ```

---

## 🛡 Security

The project uses Firestore Security Rules to ensure data integrity and privacy. Rules are defined in `firestore.rules` and cover:
- Authenticated access only.
- Team-based read/write permissions.
- Role-specific validation (e.g., only Managers can delete boards).

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by the CollabMaxx Team.
