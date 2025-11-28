# Data Storage

## Overview

This project uses a hybrid approach for data storage:

1. **Static JSON Files**: Pre-populated mock data for development and testing
2. **Browser localStorage**: Persistent storage for newly registered users

## Files

### `users.json`

Contains pre-registered demo users. These users are read-only and cannot be modified.

### `orders.json`

Contains mock order data for the dashboard.

### `loginRecords.json`

Contains mock login/logout activity records.

## New User Registration

When a new user registers:

1. The system checks if the email or mobile number already exists (in both JSON files and localStorage)
2. If validation passes, the new user is saved to browser localStorage under the key `dashflow_registered_users`
3. The new user can immediately log in with their credentials
4. New users persist across browser sessions (until localStorage is cleared)

## Authentication

The authentication system (`ApiService.authenticateUser`) checks both:

- Static users from `users.json`
- Dynamically registered users from localStorage

## Storage Service

The `UserStorageService` class (`src/services/userStorageService.ts`) handles:

- Loading all users (static + localStorage)
- Adding new users to localStorage
- Checking if a user exists
- Finding users by credentials

## Type Safety

All data operations use strict TypeScript types:

- No `any` types are used
- All user data conforms to the `User` interface
- Validation is enforced through Zod schemas

## Demo Credentials

You can log in with any user from `users.json`, for example:

- Email: `john.doe@example.com`
- Mobile: `+1234567890`
- Password: Any password (authentication is simulated)

## Note

This is a development/demo setup. In production:

- Replace localStorage with a proper backend API
- Implement real password hashing and authentication
- Use a database for persistent storage
- Add proper session management
