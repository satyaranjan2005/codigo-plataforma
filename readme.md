# Codigo Plataforma

A full-stack web application for managing student teams, events, and problem statements.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** database
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd codigo
```

#### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory (use `.env.example` as reference):

```env
DATABASE_URL="mysql://user:password@localhost:3306/codigo_db"
JWT_SECRET="your-secret-key-here"
RESEND_API_KEY="your-resend-api-key"
FRONTEND_URL="http://localhost:3000"
SUPPORT_EMAIL="support@codigoplataforma.tech"
EMAIL_FROM="Codigo Plataforma <info@codigoplataforma.tech>"
WELCOME_SUBJECT="Welcome to the Codigo Plataforma"
PORT=3000
```

Run Prisma migrations:

```bash
npx prisma generate
npx prisma db push
```

Start the backend server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:3000`

#### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3001` (or the next available port)

## 📁 Project Structure

```
codigo/
├── Backend/               # Express.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware (auth, error handling)
│   ├── prisma/           # Prisma schema and migrations
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   ├── utils/            # Utilities (email, validators, errors)
│   ├── index.js          # Express server entry point
│   └── package.json
│
└── frontend/             # Next.js frontend
    ├── public/           # Static assets
    ├── src/
    │   ├── app/          # Next.js 13+ app directory
    │   │   ├── (authpages)/    # Authentication pages
    │   │   ├── (dashboard)/    # Dashboard pages
    │   │   └── (mainsite)/     # Public pages
    │   ├── components/   # React components
    │   ├── hooks/        # Custom React hooks
    │   └── lib/          # Utilities (API client, auth)
    └── package.json
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js 5.1.0
- **Database**: MySQL with Prisma ORM 6.18.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Email**: Resend 6.4.0
- **Security**: bcryptjs 3.0.2, cors 3.0.0

### Frontend
- **Framework**: Next.js 16.0.0 with Turbopack
- **React**: 19.2.0
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Radix UI primitives
- **HTTP Client**: Axios 1.13.1

## 📝 Available Scripts

### Backend

```bash
npm install        # Install dependencies
npm start          # Start the production server
npm run dev        # Start development server with nodemon
```

### Frontend

```bash
npm install        # Install dependencies
npm run dev        # Start development server (Turbopack)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 🔑 Environment Variables

### Backend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `RESEND_API_KEY` | Resend API key for emails | `re_xxxxx` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `SUPPORT_EMAIL` | Support email address | `support@example.com` |
| `EMAIL_FROM` | Email sender address | `noreply@example.com` |
| `PORT` | Backend server port | `3000` |

### Frontend `.env.local`

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |

## 📧 Email Features

The application uses Resend for email notifications:

- **Welcome Email**: Sent when a new student registers
- **Team Creation Email**: Sent to all team members when a team is created
  - Includes team details, member list, and role designation
  - Differentiates between team leader and members
  - Provides direct link to dashboard

## 🔐 Authentication

The application uses JWT-based authentication:

1. Users register with their SIC number, name, email, phone, and password
2. Passwords are hashed using bcryptjs before storage
3. Upon login, a JWT token is issued
4. Frontend stores the token in localStorage
5. All protected routes require the `Authorization: Bearer <token>` header

## 🛡️ Error Handling

Comprehensive error handling is implemented across the stack:

### Backend
- Custom error classes (`AppError`, `BadRequestError`, `UnauthorizedError`, etc.)
- Centralized error handling middleware
- Prisma error transformation
- Input validation utilities

### Frontend
- React Error Boundary for component errors
- Toast notification system for user feedback
- API error interceptors with automatic token refresh
- User-friendly error messages

See `ERROR_HANDLING.md` for detailed documentation.

## 🎨 UI Components

The frontend uses a component library built with:
- **Radix UI** primitives for accessibility
- **Tailwind CSS** for styling
- **class-variance-authority** for component variants
- Custom components in `src/components/ui/`

## 📱 Pages

### Public Pages
- `/` - Landing page
- `/event` - Event information
- `/event/register` - Event registration
- `/login` - User login
- `/register` - User registration

### Dashboard Pages (Protected)
- `/dashboard` - Main dashboard
- `/dashboard/events` - Events management
- `/dashboard/events/registration` - Event registration
- `/dashboard/events/certificate` - Event certificates
- `/dashboard/events/settings` - Event settings
- `/dashboard/members` - Team members management
- `/dashboard/students` - Students list

## 🗄️ Database Schema

### Models
- **Student**: User accounts with authentication
- **Team**: Team entities
- **TeamMember**: Many-to-many relationship between teams and students
- **ProblemStatement**: Problem statements for teams to solve

See `Backend/prisma/schema.prisma` for the complete schema.

## 🧪 Testing

### Backend Testing

```bash
cd Backend
# Test error handling
node scripts/testErrors.js
```

### Frontend Testing

```bash
cd frontend
npm run lint     # Run linter
npm run build    # Test production build
```

## 🚦 API Routes

### Authentication
- `POST /auth/register` - Register new student
- `POST /auth/login` - Login and get JWT token

### Teams
- `POST /teams` - Create a new team
- `GET /teams` - List all teams
- `POST /teams/:id/register` - Register team for problem statement
- `GET /teams/eligible-members` - List students available for teams
- `GET /teams/eligible-members/search` - Search eligible members

### Users
- `GET /users` - List all users (admin only)
- `GET /users/search` - Search users by name, email, or SIC number

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@codigoplataforma.tech or open an issue in the repository.

## 🔧 Troubleshooting

### Backend won't start
- Ensure MySQL is running
- Check DATABASE_URL in `.env`
- Run `npx prisma generate` and `npx prisma db push`
- Verify all required environment variables are set

### Frontend build errors
- Clear `.next` cache: `Remove-Item -Recurse -Force .next`
- Delete `node_modules` and reinstall: `npm install`
- Check for "use client" directives in interactive components

### Email not sending
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for errors
- In development without API key, emails are logged to console

### Database connection errors
- Ensure MySQL service is running
- Check DATABASE_URL format and credentials
- Verify database exists: `mysql -u user -p -e "CREATE DATABASE IF NOT EXISTS codigo_db"`

## 📚 Additional Documentation

- [Error Handling Guide](./ERROR_HANDLING.md)
- [Loading States and 404 Pages](./LOADING_AND_404.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

---

Built with ❤️ by the Codigo Plataforma Team
