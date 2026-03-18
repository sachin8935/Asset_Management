# Asset Management System

A comprehensive asset management platform built with React, Vite, Flask, and PostgreSQL (Neon).

## 🌐 Live Deployment

- **Frontend:** https://asset-management-omega-three.vercel.app
- **Backend API:** https://asset-management-utgk.onrender.com

## 🔐 Test Login Credentials

### Admin Account (Full System Access)
- Email: `startwithsachin@gmail.com`
- Password: `admin123`
- Access: Login only, full system control

### IT Manager Account (Asset Management)
- Email: `rekha@gmail.com`
- Password: `rekha123`
- Access: Login only, manage asset lifecycle and assignments

### Employee Account (Self-Service)
- Email: `sachin89359@gmail.com`
- Password: `sachin123`
- Access: Can sign up or use existing account, submit requests and track assets
- **Note:** Employees can create new accounts via signup form

## 📋 Features by Role

**Admin**
- Dashboard with system statistics
- User management (create/edit IT Managers & Employees)
- Asset inventory oversight
- Issue management
- Maintenance tracking
- Activity logs

**IT Manager**
- Dashboard with asset metrics
- Asset inventory management
- Asset assignments
- Issue status tracking
- Maintenance record management

**Employee**
- Personal asset tracking
- Issue reporting
- Assignment status
- Self-service requests

## 🏗️ Project Structure

```
Asset_Management/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API services
│   │   └── hooks/       # Custom React hooks
│   └── package.json
├── server/              # Flask backend
│   ├── app/
│   │   ├── models/      # Database models
│   │   ├── routes/      # API endpoints
│   │   └── auth/        # Authentication logic
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🚀 Getting Started

### Backend Setup (server/)

1. Create and activate virtual environment:
	```bash
	python -m venv venv
	source venv/bin/activate
	```

2. Install dependencies:
	```bash
	pip install -r requirements.txt
	```

3. Configure environment:
	```bash
	cp .env.example .env
	# Update DATABASE_URL with your Neon PostgreSQL connection string
	```

4. Run backend:
	```bash
	python app.py
	```

### Frontend Setup (client/)

1. Install dependencies:
	```bash
	npm install
	```

2. Start development server:
	```bash
	npm run dev
	```

3. Build for production:
	```bash
	npm run build
	```

## 🔗 API Base URL

- **Development:** `http://127.0.0.1:5050`
- **Production:** `https://asset-management-utgk.onrender.com`

## 📚 Additional Resources

- [Backend Documentation](./server/README.md)
- [Frontend Documentation](./client/README.md)
- [API Catalog](./server/docs/API_CATALOG.md)
- Daily Update: https://1drv.ms/x/c/8978ed0b12505115/IQB7UphcxGb2Srq9RZnRhWEsAWuddQFc1sIl7SLjGqB4t94?e=DoM5Ra

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite 7
- React Router 7
- Tailwind CSS 4

**Backend:**
- Flask 3
- SQLAlchemy
- PostgreSQL (Neon)
- JWT Authentication

**Deployment:**
- Vercel (Frontend)
- Render (Backend)
