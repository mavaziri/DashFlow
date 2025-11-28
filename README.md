# DashFlow - User Management System

A comprehensive Next.js 15 TypeScript application with strict type safety, featuring user registration, authentication, and order management dashboard.

## Features

- **User Registration & Authentication**

  - Type-safe form validation with Zod and React Hook Form
  - Email and mobile number support for login
  - Secure authentication flow

- **Dashboard Management**

  - Welcome messages and user profile display
  - Recent login/logout activity tracking
  - Order management with search and filtering capabilities
  - Real-time order status tracking

- **UI**

  - Bootstrap 5.3 responsive design
  - Clean and modern interface
  - Mobile-friendly responsive layout
  - Accessible form components

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript (strict mode)
- **Styling**: Bootstrap 5.3 + React Bootstrap
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: React Context API
- **Data Simulation**: JSON files (simulating API endpoints)
- **Package Manager**: Yarn

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd DashFlow
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linting
yarn lint

# Run type checking
yarn type-check
```

## Usage

### Registration

1. Navigate to the registration form
2. Fill in required information:
   - First Name
   - Last Name
   - Email Address
   - Mobile Number
   - Address
3. Submit the form to create an account

### Login

1. Use email address or mobile number as username
2. Enter any password (demo mode)
3. Access the dashboard upon successful login

### Dashboard Features

- **Welcome Section**: Personalized greeting and user information
- **Recent Activities**: Track recent login/logout activities
- **Order Management**:
  - View all orders with pagination
  - Search orders by buyer name or order number
  - Filter by order status
  - Sort by various criteria

## Demo Credentials

For testing purposes, you can use any of these email addresses or mobile numbers:

- **Email**: john.doe@example.com, jane.smith@example.com, etc.
- **Mobile**: +1234567890, +1987654321, etc.
- **Password**: Any password (demo mode)

## Type Safety Features

- Strict TypeScript configuration with `noImplicitAny`
- Generic classes with type constraints
- Comprehensive interface definitions
- Zod schema validation for runtime type checking
- No usage of `any` type throughout the codebase

## Architecture Highlights

- **Generic Data Service**: Type-safe data management with search/filter capabilities
- **Validation Layer**: Zod schemas for both client and server-side validation
- **Context-based Authentication**: Clean separation of auth logic
- **Component Composition**: Reusable and maintainable React components
- **Type-safe API Layer**: Simulated API with proper TypeScript interfaces

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Ensure all type checking passes
5. Submit a pull request

## License

This project is for demonstration purposes.

## Notes

- This is a demo application with simulated API endpoints using JSON files
- In production, replace JSON data files with actual API calls
- Password validation is simplified for demo purposes
- Consider implementing proper authentication tokens and security measures for production use
