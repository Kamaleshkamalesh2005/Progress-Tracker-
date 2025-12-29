<div align="center">

# 🎯 Progress Tracker - Main Application

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*A comprehensive platform for tracking learning progress across multiple coding platforms and educational resources*

</div>

---

## 📋 Project Overview

Progress Tracker is a modern, feature-rich web application designed to help students, teachers, and administrators monitor and manage learning progress across various coding platforms including:

- 🟢 **LeetCode** - Algorithmic problem solving
- 🔵 **GeeksforGeeks** - Comprehensive coding tutorials
- 🟡 **HackerRank** - Competitive programming
- 🔴 **CodeChef** - Coding challenges
- And 6+ more platforms!

Built with cutting-edge technologies, the application offers an intuitive interface with role-based access control, real-time analytics, and comprehensive performance tracking capabilities.

---

## ✨ Key Features

### 🎓 **Multi-Platform Tracking**
Monitor progress across 10+ coding platforms with unified dashboard

### 👥 **Role-Based Access Control**
- **Students**: Track personal progress and view analytics
- **Teachers**: Monitor student progress and manage class activities
- **Admins**: Manage departments and oversee teacher activities
- **Super Admins**: Full system control and configuration

### 🏢 **Department Management**
Organize users by departments and institutions with hierarchical structure

### 📊 **Performance Analytics**
- Track completion rates and scores
- Platform usage statistics
- Progress visualization with charts
- Historical data tracking

### 📢 **Announcement System**
Real-time communication system for staff and students

### ✅ **Staff Approval Workflow**
Streamlined approval process for teacher and admin registrations

### 🎨 **Beautiful UI/UX**
- Dark/Light theme support
- Fully responsive design
- Smooth animations with Framer Motion
- 3D graphics powered by Three.js

---

## 🛠 Technologies Used

This project leverages modern web technologies:

### **Core Stack**
- ![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=white) **React 18** with TypeScript
- ![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat-square&logo=vite&logoColor=white) **Vite** - Lightning-fast build tool
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript&logoColor=white) **TypeScript** - Type-safe development

### **UI & Styling**
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) **Tailwind CSS** - Utility-first styling
- ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Components-000000?style=flat-square) **shadcn/ui** - Beautiful component library
- ![Radix UI](https://img.shields.io/badge/Radix_UI-Primitives-161618?style=flat-square) **Radix UI** - Accessible component primitives

### **Animation & 3D Graphics**
- ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.18.2-0055FF?style=flat-square&logo=framer&logoColor=white) **Framer Motion** - Smooth animations
- ![Three.js](https://img.shields.io/badge/Three.js-0.170.0-000000?style=flat-square&logo=three.js&logoColor=white) **Three.js** - 3D graphics
- ![React Three Fiber](https://img.shields.io/badge/R3F-8.18.0-000000?style=flat-square) **React Three Fiber** - React renderer for Three.js
- ![Recharts](https://img.shields.io/badge/Recharts-2.15.4-8884d8?style=flat-square) **Recharts** - Data visualization

### **State & Data Management**
- ![React Query](https://img.shields.io/badge/React_Query-5.83.0-FF4154?style=flat-square&logo=react-query&logoColor=white) **TanStack React Query** - Data fetching & caching
- ![Supabase](https://img.shields.io/badge/Supabase-2.76.1-3ECF8E?style=flat-square&logo=supabase&logoColor=white) **Supabase** - Backend & authentication
- ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7.61.1-EC5990?style=flat-square) **React Hook Form** - Form management
- ![Zod](https://img.shields.io/badge/Zod-3.25.76-3E67B1?style=flat-square) **Zod** - Schema validation

### **Routing & Navigation**
- **React Router DOM 6.30.1** - Client-side routing

### **Development Tools**
- ![ESLint](https://img.shields.io/badge/ESLint-9.32.0-4B32C3?style=flat-square&logo=eslint&logoColor=white) **ESLint** - Code linting
- ![PostCSS](https://img.shields.io/badge/PostCSS-8.5.6-DD3A0A?style=flat-square&logo=postcss&logoColor=white) **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm**, **yarn**, or **bun** package manager
- **Git** for version control

### Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Access the application**
   
   Open your browser and navigate to: `http://localhost:8080`

### Building for Production

```bash
npm run build
# or
yarn build
# or
bun build
```

Build output will be in the `dist/` directory.

### Running Linter

```bash
npm run lint
# or
yarn lint
# or
bun lint
```

---

## 📁 Project Structure

```
code-nexus-3d-main/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── ...             # Custom components
│   ├── pages/              # Page components
│   │   ├── dashboard/      # Role-specific dashboards
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── SuperAdminDashboard.tsx
│   │   ├── Auth.tsx        # Authentication page
│   │   └── Index.tsx       # Landing page
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.tsx     # Authentication hook
│   ├── lib/                # Utility libraries
│   ├── services/           # API service layer
│   ├── utils/              # Helper functions
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client & types
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/                 # Static assets
├── backend/               # Backend configuration
├── supabase/              # Supabase migrations & config
├── components.json        # shadcn/ui configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

---

## 🎨 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## 🔐 Authentication & User Roles

The application uses **Supabase** for authentication and supports four distinct user roles:

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| 👨‍🎓 **Student** | Basic | Personal progress tracking, view analytics |
| 👨‍🏫 **Teacher** | Elevated | Monitor students, post announcements |
| 🔐 **Admin** | Advanced | Manage departments, approve teachers |
| 🔑 **Super Admin** | Full | Complete system control, manage all users |

---

## 🌐 Deployment

### Deploy to Lovable

1. Open [Lovable](https://lovable.dev/projects/64e36bc9-6126-426f-bc92-c5589f9ca62c)
2. Click on **Share** → **Publish**
3. Your application will be live!

### Custom Domain

To connect a custom domain:
1. Navigate to **Project** → **Settings** → **Domains**
2. Click **Connect Domain**
3. Follow the setup instructions

Learn more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues, questions, or suggestions, please visit the [Issues](https://github.com/Kamaleshkamalesh2005/Progress-Tracker-/issues) page.

---

<div align="center">

Made with ❤️ by the Progress Tracker Team

</div>
