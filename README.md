# 🚀 StoreX: The Ultimate File Management Solution

StoreX is a modern, high-performance file storage and management platform built with a focus on security, speed, and a premium user experience. Leveraging a monorepo architecture, StoreX integrates a robust Express backend with a cutting-edge React frontend to provide seamless file operations powered by AWS S3.

![StoreX Banner](apps/ui/public/App_Image.png)

---

## ✨ Key Features

- **🔐 Secure Authentication**: Multi-layered security with JWT, bcrypt hashing, and OTP verification via email.
- **🛡️ Multi-Factor Authentication (MFA)**: Support for 2FA using TOTP (Google Authenticator) with QR code generation.
- **📁 Cloud Storage Integration**: Direct, secure file uploads and management using AWS S3.
- **📊 Real-time Dashboard**: A sleek, responsive interface to manage your files, see storage stats, and more.
- **🎨 Premium UI/UX**: Built with Tailwind CSS 4, Framer Motion for smooth animations, and Shadcn UI components.
- **⚡ Monorepo Architecture**: Efficient development workflow powered by Turborepo and pnpm workspaces.

---

## 🛠️ Tech Stack

### Frontend (`apps/ui`)

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query (v5)](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend (`apps/api`)

- **Runtime**: [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Storage**: [AWS S3 SDK](https://aws.amazon.com/s3/)
- **Security**: [Passport](http://www.passportjs.org/), [Speakeasy](https://github.com/speakeasyjs/speakeasy), [JsonWebToken](https://github.com/auth0/node-jsonwebtoken)

### Infrastructure & Tooling

- **Monorepo**: [Turborepo](https://turbo.build/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Shared Packages**: Environment management & HTTP utilities.

---

## 📂 Project Structure

```text
StoreX/
├── apps/
│   ├── api/            # Express Backend
│   └── ui/             # React Frontend
├── packages/
│   ├── env/            # Shared Environment Config
│   └── httpUtils/      # Shared HTTP Utilities
├── services/
│   ├── emailServices/  # Email Sending Logic
│   └── fileUpload/     # AWS S3 Integration
├── turbo.json          # Turborepo Configuration
└── package.json        # Main Monorepo Entry
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS)
- pnpm (`npm install -g pnpm`)
- MongoDB (Local or Atlas)
- AWS S3 Bucket (for file storage)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/storex.git
   cd storex
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in `apps/api` and `apps/ui` (or use the shared `@packages/env`) with the following:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

4. **Run the application:**
   ```bash
   pnpm dev
   ```
   This will start both the API and the UI concurrently using Turborepo.

---

## 📜 Available Scripts

- `pnpm dev`: Start all apps in development mode.
- `pnpm build`: Build all apps for production.
- `pnpm lint`: Run linting across the monorepo.
- `pnpm format`: Format the code using Prettier.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [ISC License](LICENSE).
