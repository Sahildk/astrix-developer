# 🏙️ TenantWatch

> **"Empowering tenants. Fixing communities. Anonymously."**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![AI Powered](https://img.shields.io/badge/AI-Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface)](https://huggingface.co/)

TenantWatch is a modern platform designed to help tenants report housing issues **anonymously** and **securely**. By aggregating reports on an interactive heatmap, it identifies problem areas and bad actors (negligent landlords) without exposing the identity of the reporter.

---

## ✨ Key Features

### 🛡️ Anonymous Reporting
Submit issues without fear of retaliation. Your personal contact details are **encrypted** and visible only to verified admins, never to landlords or the public.

### 🤖 AI Auto-Classification
Simply describe your issue (e.g., *"The ceiling is leaking and there's mold"*). Our built-in **AI Engine** (powered by Hugging Face) automatically categorizes it as **Maintenance**, **Safety Hazard**, **Harassment**, or **Unfair Rent**.

### 🗺️ Interactive Community Heatmap
Visualize the density of reports in your neighborhood.
*   **Search & Jump**: Instantly find your area (e.g., "Whitefield").
*   **Smart Filters**: Filter by **Category** (e.g., Safety Only) or **Date** (Last 7 Days).
*   **Severity Indicators**: Color-coded zones (Red = High Severity).

### 👑 Admin Dashboard
A dedicated portal for community moderators to:
*   **Verify** incoming reports with evidence.
*   **Update Status** (Reported → In Progress → Resolved).
*   **Access Private Contact Info** for emergencies.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Styling**: Tailwind CSS + Shadcn/UI
*   **Animations**: Framer Motion
*   **Maps**: Leaflet (via React-Leaflet)

### Backend
*   **API**: FastAPI (Python 3.10+)
*   **Database**: MongoDB Atlas (Cloud)
*   **AI/ML**: Hugging Face Inference API (Zero-Shot Classification)
*   **ODM**: Motor (Async MongoDB driver)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   MongoDB Atlas Account

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/tenant-watch.git
cd tenant-watch
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
MONGODB_URI=mongodb+srv://<your_user>:<your_pass>@cluster.mongodb.net/?retryWrites=true&w=majority
HF_TOKEN=hf_your_hugging_face_token
```

Run the server:
```bash
uvicorn app:app --reload
# API running at http://localhost:8000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

Run the client:
```bash
npm run dev
# App running at http://localhost:3000
```

---

## 📂 Project Structure

```
tenant-watch/
├── backend/            # FastAPI Server
│   ├── app.py          # Main Application Entry
│   ├── classifier.py   # AI Logic
│   └── database.py     # DB Connection
├── frontend/           # Next.js Application
│   ├── src/app/        # Pages & Routes
│   ├── src/components/ # UI Components (Heatmap, Forms)
│   └── src/lib/        # Utilities (Store, Admin API)
└── README.md
```

## 🤝 Contributing
Contributions are welcome! Please open an issue or PR to suggest improvements.

## 📄 License
MIT License.
