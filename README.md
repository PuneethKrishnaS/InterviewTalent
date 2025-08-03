# 🎯 Interview Talent — AI-powered interview preparation platform

## 🌟 Project Overview

**Interview Talent** is a full-stack web application designed to revolutionize interview preparation for tech professionals. Unlike traditional fragmented methods, this platform offers a **holistic and integrated solution**—combining AI-driven mock interviews, real-time feedback on communication, non-verbal cues, and technical skills.

Whether you're brushing up on coding challenges or refining your soft skills, **Interview Talent** helps you build confidence and perform your best in real-world interviews.

> 🔧 Built as a **monorepo** with both the client-side (React) and server-side (Node.js) codebases.

---

## ✨ Key Features

- **🤖 AI-Based Mock Interviews**
  Simulate realistic interviews with dynamically generated questions using the **OpenAI API**.

- **🎥 Multi-Modal Feedback**
  Get real-time insights into your **verbal** and **non-verbal** communication.

- **🗣️ Verbal Analysis**

  - Transcription via **Google Cloud Speech-to-Text**
  - Clarity and content evaluation using AI models

- **😐 Non-Verbal Analysis**

  - Analyze facial expressions and emotional state via **face-api.js (TensorFlow\.js)**

- **🧰 Integrated Toolkit**
  Centralized dashboard with everything needed for comprehensive preparation.

- **📄 Resume Builder**
  Create **ATS-friendly resumes** with professional PDF exports.

- **🔗 Profile Integration**
  Connect your **LeetCode** and **GitHub** profiles to showcase your journey.

- **💻 Real-time Code Editor**
  Practice coding challenges directly in the browser.

- **🎨 User-Centric UI**
  Built with a consistent **dark theme** using **Tailwind CSS** and **Shadcn UI** components.

---

## 🚀 Technology Stack

### 🧠 Frontend

| Technology         | Purpose                         |
| ------------------ | ------------------------------- |
| **React.js**       | Frontend framework              |
| **Tailwind CSS**   | Utility-first styling           |
| **Shadcn UI**      | UI components                   |
| **Redux Toolkit**  | State management                |
| **react-pdf**      | Resume PDF generation           |
| **Web Speech API** | Real-time transcription         |
| **face-api.js**    | Facial recognition and analysis |

### 🛠 Backend

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| **Node.js**       | Backend runtime                |
| **Express.js**    | Web framework                  |
| **MongoDB Atlas** | Cloud-based NoSQL database     |
| **Mongoose**      | ODM for MongoDB                |
| **Auth0**         | Authentication & Authorization |

### 🌐 APIs & Integrations

| Service                         | Usage                             |
| ------------------------------- | --------------------------------- |
| **OpenAI API**                  | AI question generation & analysis |
| **Google Cloud Speech-to-Text** | Audio transcription               |
| **GitHub REST API**             | Profile data integration          |
| **LeetCode GraphQL API**        | Coding profile integration        |

---

## ⚙️ Getting Started

### ✅ Prerequisites

Ensure you have the following installed:

- **Node.js** (v18+)
- **MongoDB Atlas** account
- **Auth0** account
- **Git**

---

### 📦 Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/Interview-Talent.git
cd Interview-Talent
```

---

#### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

> The frontend should now be running at: [http://localhost:5173](http://localhost:5173)

---

#### 3. Backend Setup

```bash
cd ../server
npm install
touch .env
```

Add the following variables to your `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
AUTH0_AUDIENCE=your_auth0_api_identifier_here
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain.auth0.com/
```

Run the backend server:

```bash
npm run dev
```

> Your backend will run at: [http://localhost:5000](http://localhost:5000)

---

## 🤝 Contribution

We welcome all contributions!
If you have suggestions for features, improvements, or bug fixes:

- Open an issue
- Submit a pull request

---

## 📜 License

This project is licensed under the **MIT License**.
