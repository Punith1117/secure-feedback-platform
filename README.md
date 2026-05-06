# Secure Feedback Platform

A modern, secure feedback collection system built with Next.js, designed for educational institutions to gather anonymous student feedback on courses and lectures.

## 🚀 Features

### For Administrators
- **Secure Authentication**: User authentication with Better Auth
- **Feedback Instance Management**: Create and manage multiple feedback sessions
- **Course Management**: Add and organize courses within feedback instances
- **Access Code Generation**: Generate unique access codes for students
- **Real-time Analytics**: View feedback statistics and responses in real-time
- **PDF Export**: Export feedback data as PDF reports

### For Students
- **Anonymous Feedback**: Submit feedback anonymously using access codes
- **Simple Interface**: Clean, intuitive feedback submission form
- **Rating System**: Rate lecture quality and course content (Good/Average/Bad)
- **One-time Use**: Each access code can only be used once

## 🛠 Tech Stack

- **Frontend**: Next.js 16.2.4, React 19.2.4, TypeScript
- **Styling**: TailwindCSS 4
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Real-time**: Ably
- **PDF Generation**: jsPDF
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Ably API key for real-time features

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd secure-feedback-platform
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the environment example file:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key
ABLY_API_KEY=your-ably-api-key
NEXT_PUBLIC_ABLY_API_KEY=your-ably-api-key
```

### 4. Database Setup

Generate and run database migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── actions.ts         # Server actions
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── feedback/         # Student feedback pages
│   └── admin/            # Admin dashboard pages
├── components/            # React components
│   ├── admin-*.tsx       # Admin-specific components
│   ├── student-*.tsx     # Student-specific components
│   └── auth/             # Authentication components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication configuration
│   ├── db/               # Database configuration and schema
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

## 🏗 Architecture

### Database Schema

The application uses a relational database with the following main entities:

- **Users**: Admin accounts for managing feedback instances
- **Feedback Instances**: Individual feedback sessions with unique join codes
- **Courses**: Courses associated with feedback instances
- **Student Access Codes**: One-time codes for student access
- **Feedback Submissions**: Student feedback submissions
- **Feedback Responses**: Individual ratings for courses

### Authentication Flow

1. Admin users sign up/sign in through Better Auth
2. Sessions are managed securely with HTTP-only cookies
3. Protected routes require authentication

### Feedback Collection Flow

1. Admin creates a feedback instance with courses
2. System generates unique access codes for students
3. Students use join codes + access codes to submit feedback
4. Feedback is stored anonymously with ratings
5. Admin can view analytics and export reports

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db:generate      # Generate database migrations
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio
```

## 🔐 Security Features

- **Access Control**: Role-based access (Admin vs Student)
- **One-time Codes**: Each access code can only be used once
- **Secure Authentication**: JWT-based authentication with Better Auth
- **Data Validation**: Input validation and sanitization
- **Environment Variables**: Sensitive data stored in environment variables

## 📊 Data Model

### Feedback Rating System

Students can rate two aspects of each course:

1. **Lecture Quality**: 
   - Good
   - Average  
   - Bad

2. **Course Content**:
   - Good
   - Average
   - Bad

### Access Code System

- **Join Codes**: 8-character codes for feedback instances
- **Access Codes**: 8-character codes for individual student access
- **One-time Use**: Each access code becomes invalid after use

## 🚀 Deployment

### Environment Variables

Ensure these environment variables are set in production:

```env
DATABASE_URL=          # PostgreSQL connection string
BETTER_AUTH_URL=       # Your application URL
BETTER_AUTH_SECRET=    # Random secret string
ABLY_API_KEY=          # Ably API key for real-time features
NEXT_PUBLIC_ABLY_API_KEY= # Public Ably API key
```

### Vercel Deployment (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms

The application can be deployed to any platform supporting Node.js:

```bash
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the database schema in `src/lib/db/schema.ts`

## 🔮 Future Enhancements

- [ ] Email notifications for new feedback
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Integration with learning management systems
- [ ] Custom rating scales
- [ ] Comment/feedback text fields
