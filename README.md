# Link Vault 🔗

A modern, full-stack URL shortener built with the MERN stack. Designed with a focus on clean UI/UX, responsive glassmorphism, and an interactive particle background.

**Live Demo:** (https://code-io-pranav.vercel.app/)

## ✨ Features
* **Lightning Fast Shortening:** Instantly convert long, cumbersome URLs into clean, manageable links.
* **Click Tracking:** Built-in analytics to track how many times each shortened link has been accessed.
* **Interactive UI:** Features a dynamic, reactive particle background built with `react-tsparticles`.
* **Theme Switching:** Seamless Light/Dark mode toggle with persistent state.
* **Responsive Design:** Fully styled with Tailwind CSS, utilizing modern glassmorphism effects.

## 🛠️ Tech Stack
**Frontend:**
* React.js (Vite)
* Tailwind CSS
* `tsparticles` (Interactive background)
* Lucide React (Icons)

**Backend:**
* Node.js & Express.js
* MongoDB Atlas (Mongoose)
* RESTful API Architecture

**Deployment:**
* Frontend hosted on **Vercel**
* Backend hosted on **Render**
* Database hosted on **MongoDB Atlas**

## 🚀 Local Setup

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/keepgrowingbus123/CodeIO-Pranav.git
cd CodeIO-Pranav
\`\`\`

**2. Backend Configuration**
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` directory and add your MongoDB URI:
\`\`\`env
MONGO_URI=mongodb+srv://keepgrowingbus123_db_user:UEoBArAOfjDybM6m@cluster0.89wcasc.mongodb.net/
\`\`\`
Start the server:
\`\`\`bash
node server.js
\`\`\`

**3. Frontend Configuration**
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

---
*Developed as a technical recruitment submission.*
