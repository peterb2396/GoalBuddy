# GoalBuddy Authentication Setup Guide

## Overview

GoalBuddy now includes a complete user authentication system with JWT tokens, secure password hashing, and user-specific goal storage. Multiple users can now create accounts, log in, and manage their own goals independently.

## Features

✅ User registration with email validation  
✅ Secure login with JWT tokens  
✅ Password hashing with bcrypt  
✅ Token-based authentication for all API endpoints  
✅ User-specific goal storage  
✅ Automatic token refresh  
✅ Secure logout functionality  
✅ No email functionality required (all auth is local)

## Backend Changes

### New Files

1. **`backend/models/User.js`** - User model with:
   - Email (unique, validated)
   - Password (hashed with bcrypt)
   - Name
   - Password comparison method
   
2. **`backend/middleware/auth.js`** - JWT authentication middleware

### Updated Files

1. **`backend/server.js`**
   - Added authentication routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
   - Protected all goal routes with authentication middleware
   - Updated notification system for multi-user support

2. **`backend/models/Goal.js`**
   - Changed `userId` from String to ObjectId reference to User model

3. **`backend/models/PushToken.js`**
   - Changed `userId` from String to ObjectId reference to User model

4. **`backend/package.json`**
   - Added `jsonwebtoken` for JWT tokens
   - Added `bcryptjs` for password hashing

## Frontend Changes

### New Files

1. **`frontend/context/AuthContext.js`** - Authentication context provider
2. **`frontend/screens/LoginScreen.js`** - Login UI
3. **`frontend/screens/RegisterScreen.js`** - Registration UI

### Updated Files

1. **`frontend/App.js`**
   - Wrapped app with `AuthProvider`
   - Added authentication stack navigation
   - Conditional rendering based on auth state

2. **`frontend/services/api.js`**
   - Added `authAPI` methods (register, login, getCurrentUser)
   - Added interceptors to attach JWT token to all requests
   - Added response interceptor for handling 401 errors

3. **`frontend/screens/HomeScreen.js`**
   - Added logout button
   - Added user name display

4. **`frontend/package.json`**
   - Added `@react-native-async-storage/async-storage` for secure token storage

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install new dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your settings:
   ```env
   MONGODB_URI=mongodb://localhost:27017/goal-tracker
   JWT_SECRET=your-super-secret-key-change-this-in-production
   PORT=3000
   ```

   **⚠️ IMPORTANT:** Change `JWT_SECRET` to a long, random string in production!

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install new dependencies:
   ```bash
   npm install
   ```

3. Update the API URL in `frontend/services/api.js`:
   ```javascript
   const API_URL = 'http://YOUR_LOCAL_IP:3000/api';
   ```
   Replace `YOUR_LOCAL_IP` with your computer's IP address (not localhost).

4. Start the app:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer {jwt-token}

Response:
{
  "id": "user-id",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Protected Goal Endpoints

All goal endpoints now require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer {jwt-token}
```

- `GET /api/goals` - Get all goals for authenticated user
- `GET /api/goals/:id` - Get specific goal (must belong to user)
- `POST /api/goals` - Create new goal for authenticated user
- `PUT /api/goals/:id` - Update goal (must belong to user)
- `DELETE /api/goals/:id` - Delete goal (must belong to user)
- `POST /api/goals/reorder` - Reorder user's goals
- `PUT /api/goals/:goalId/subitems/:subItemId` - Update sub-item
- `POST /api/push-token` - Register push notification token for user

## Using the App

### Registration

1. Open the app
2. Tap "Sign Up" on the login screen
3. Enter your name, email, and password
4. Tap "Create Account"
5. You'll be automatically logged in

### Login

1. Open the app
2. Enter your email and password
3. Tap "Log In"
4. Access your goals!

### Logout

1. From the home screen, tap the logout icon (top right)
2. Confirm logout
3. You'll be returned to the login screen

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Plain text passwords are never stored in the database
- Password comparison is done securely using bcrypt

### JWT Tokens
- Tokens expire after 30 days
- Tokens are stored securely in AsyncStorage
- Tokens are automatically attached to all API requests
- Invalid or expired tokens trigger automatic logout

### API Security
- All goal endpoints require authentication
- Users can only access their own goals
- Push tokens are user-specific
- Authorization checks prevent unauthorized access

## Migration from Old Data

If you have existing goals in the database with the old `userId: 'default-user'` format, they won't be accessible with the new authentication system. You have two options:

### Option 1: Start Fresh
Simply create a new account and start adding goals. This is recommended.

### Option 2: Migrate Old Data
If you need to preserve old goals:

1. Create a new user account through the app
2. Note your user ID from the MongoDB database
3. Update existing goals in MongoDB:
   ```javascript
   db.goals.updateMany(
     { userId: 'default-user' },
     { $set: { userId: ObjectId('your-new-user-id') } }
   )
   ```

## Troubleshooting

### "Invalid token" errors
- Clear the app data (uninstall and reinstall)
- Make sure the JWT_SECRET matches between server restarts

### Cannot login
- Check that MongoDB is running
- Verify the email and password are correct
- Check backend console for error messages

### Goals not loading
- Ensure you're logged in
- Check network connection
- Verify API_URL is correct in `api.js`

### Token expired
- Simply login again
- Tokens last 30 days by default

## Production Considerations

Before deploying to production:

1. **Change JWT_SECRET** to a long, random string
2. **Use environment variables** for all secrets
3. **Enable HTTPS** for all API communications
4. **Add rate limiting** to prevent brute force attacks
5. **Consider refresh tokens** for longer sessions
6. **Add email verification** if needed
7. **Implement password reset** functionality
8. **Add logging and monitoring**
9. **Use a production MongoDB instance**
10. **Add proper error handling and validation**

## Future Enhancements

Potential additions for future versions:

- Email verification
- Password reset functionality
- Social login (Google, Apple, etc.)
- Two-factor authentication
- Account settings page
- Profile picture upload
- Export/import goals
- Goal sharing between users
- Team/collaborative goals

## Support

If you encounter any issues:

1. Check this guide thoroughly
2. Review the error messages in the console
3. Verify all dependencies are installed
4. Make sure MongoDB is running
5. Check that your API_URL is correct

---

**Note:** This authentication system is designed for personal/small-scale use. For production applications with many users, consider additional security measures and professional security audits.
