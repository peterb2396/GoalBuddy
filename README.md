# 🎯 Goal Tracker App

A beautiful and sophisticated React Native goal tracking application with a Node.js Express backend. Track discrete goals and continuous habits with an elegant beige and white theme with colorful accents.

## ✨ Features

### Core Features
- **Discrete Goals**: One-time goals that can be completed
- **Continuous Goals**: Habit-based goals that reset daily, weekly, or monthly
- **Sub-Items**: Add checklist or progress-based sub-items to each goal
- **Drag & Drop**: Reorder goals and sub-items easily
- **Beautiful Animations**: Confetti celebrations, animated checkboxes, and smooth transitions
- **Progress Tracking**: Visual progress bars with color-coded completion status
- **Push Notifications**: Daily reminders at 8 AM for your top 3 prioritized goals
- **Priority System**: Organize goals by priority (0-3)
- **Color Themes**: Choose from 6 beautiful accent colors for each goal

### UI/UX Highlights
- Modern beige and white color scheme with vibrant accent colors
- Animated checkboxes with spring animations
- Gradient progress bars with real-time updates
- Confetti cannon celebration on sub-item completion
- Haptic feedback for tactile interactions
- Smooth drag-and-drop reordering
- Responsive and intuitive interface

## 📁 Project Structure

```
goal-tracker-app/
├── backend/                 # Node.js Express API
│   ├── models/
│   │   ├── Goal.js         # Goal schema with sub-items
│   │   └── PushToken.js    # Push notification tokens
│   ├── server.js           # Express server with API routes
│   ├── package.json
│   └── .env
│
├── frontend/                # React Native (Expo) app
│   ├── components/
│   │   ├── AnimatedCheckbox.js
│   │   ├── AnimatedProgressBar.js
│   │   ├── SubItemCard.js
│   │   └── GoalCard.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── CreateGoalScreen.js
│   │   └── EditGoalScreen.js
│   ├── services/
│   │   ├── api.js          # Backend API integration
│   │   └── notifications.js # Push notification service
│   ├── theme.js            # App theme configuration
│   ├── App.js              # Main app component
│   ├── app.json            # Expo configuration
│   ├── eas.json            # EAS build configuration
│   ├── babel.config.js
│   └── package.json
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- A physical device or emulator for testing

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Edit .env file with your MongoDB URI
MONGODB_URI=mongodb://localhost:27017/goal-tracker
PORT=3000
```

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update the API URL in `services/api.js`:
```javascript
// For local development, use your computer's IP address
const API_URL = 'http://YOUR_LOCAL_IP:3000/api';
// Example: const API_URL = 'http://192.168.1.100:3000/api';
```

4. Start the Expo development server:
```bash
npm start
```

5. Scan the QR code with Expo Go app (iOS/Android) or press:
   - `a` for Android emulator
   - `i` for iOS simulator
   - `w` for web

## 📱 Building with EAS

### Setup EAS

1. Login to your Expo account:
```bash
eas login
```

2. Configure the project:
```bash
eas build:configure
```

3. Update `app.json` with your project ID (obtained from Expo dashboard)

### Build for Android

```bash
# Development build
eas build --platform android --profile development

# Production APK
eas build --platform android --profile production
```

### Build for iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

## 🎨 Theme Customization

The app uses a beautiful beige and white theme with colorful accents. You can customize colors in `frontend/theme.js`:

```javascript
export const theme = {
  colors: {
    background: '#F5F1E8',      // Main background
    cardBackground: '#FFFFFF',   // Card background
    primary: '#E8B4B8',         // Soft pink
    secondary: '#B8D4E8',       // Soft blue
    // ... more colors
  }
};
```

## 🔔 Notifications Setup

### Backend Configuration
The backend automatically sends daily notifications at 8 AM using `node-cron`. The scheduler is configured in `backend/server.js`.

### Frontend Configuration
Push notifications are handled using Expo Notifications. The app requests permissions on launch and registers the device token with the backend.

To test notifications manually:
```bash
# Send a test notification via API
curl -X POST http://localhost:3000/api/test-notification
```

## 📊 API Endpoints

### Goals
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get single goal
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/reorder` - Reorder goals

### Sub-Items
- `PUT /api/goals/:goalId/subitems/:subItemId` - Update sub-item

### Notifications
- `POST /api/push-token` - Register push token
- `POST /api/test-notification` - Send test notification

### Health
- `GET /api/health` - Server health check

## 🏗️ Data Models

### Goal Schema
```javascript
{
  title: String,
  type: 'discrete' | 'continuous',
  resetFrequency: 'daily' | 'weekly' | 'monthly',
  subItems: [{
    id: String,
    title: String,
    type: 'checkbox' | 'progress',
    isChecked: Boolean,
    currentValue: Number,
    targetValue: Number,
    order: Number
  }],
  isCompleted: Boolean,
  priority: Number,
  order: Number,
  color: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Usage Guide

### Creating a Goal
1. Tap the **+** button on the home screen
2. Enter goal title and select type (Discrete or Continuous)
3. For continuous goals, choose reset frequency
4. Add sub-items (checkbox or progress type)
5. Choose a color theme and priority
6. Tap Save

### Tracking Progress
1. Tap a goal card to expand it
2. For checkboxes: Tap to check/uncheck (triggers confetti!)
3. For progress bars: Tap the edit icon to update values
4. Goals auto-complete when all sub-items are done

### Reordering
- **Goals**: Long-press and drag goal cards to reorder
- **Sub-Items**: Long-press and drag sub-items within a goal

### Editing/Deleting
1. Tap a goal card to expand
2. Tap "Edit Goal" button
3. Make changes or scroll down to delete

## 🛠️ Tech Stack

### Frontend
- React Native with Expo
- React Navigation
- React Native Reanimated
- React Native Gesture Handler
- Draggable FlatList
- Confetti Cannon
- Expo Notifications
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- Node-cron (scheduling)
- Expo Server SDK (push notifications)

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB Connection Failed**: Ensure MongoDB is running or check your connection string
- **Port Already in Use**: Change the PORT in `.env` file

### Frontend Issues
- **API Not Connecting**: Update the API_URL in `services/api.js` with your local IP
- **Notifications Not Working**: Ensure you're testing on a physical device (notifications don't work in simulators)
- **Build Errors**: Clear cache with `expo start --clear`

### Common Solutions
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
expo start --clear
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Built with ❤️ using React Native, Node.js, and Expo**
