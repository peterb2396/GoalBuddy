# 🚀 Complete Setup Guide

This guide will help you set up and run the Goal Tracker app from scratch.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- [ ] **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [ ] **Expo CLI** - Install with: `npm install -g expo-cli`
- [ ] **EAS CLI** - Install with: `npm install -g eas-cli`
- [ ] **A smartphone** with Expo Go app installed ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## 🎯 Quick Start (5 Minutes)

### Step 1: Clone or Download the Project

If you have the project files, navigate to the project directory:
```bash
cd goal-tracker-app
```

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start MongoDB (if using local installation)
# macOS/Linux:
brew services start mongodb-community
# or
sudo systemctl start mongod

# Start the backend server
npm start
```

The backend should now be running at `http://localhost:3000`

### Step 3: Setup Frontend

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Find your computer's IP address
# macOS/Linux:
ifconfig | grep "inet "
# Windows:
ipconfig

# Edit services/api.js and update API_URL with your IP:
# const API_URL = 'http://YOUR_IP_ADDRESS:3000/api';
# Example: const API_URL = 'http://192.168.1.100:3000/api';

# Start Expo
npm start
```

### Step 4: Run on Your Phone

1. Open **Expo Go** app on your smartphone
2. Scan the QR code displayed in your terminal
3. Wait for the app to load
4. Enjoy! 🎉

## 🔧 Detailed Setup

### Backend Setup (Detailed)

#### Option A: Local MongoDB

1. **Install MongoDB:**
   - **macOS**: `brew install mongodb-community`
   - **Windows**: [Download installer](https://www.mongodb.com/try/download/community)
   - **Linux**: Follow [official docs](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows (run as admin)
   net start MongoDB
   ```

3. **Verify MongoDB is running:**
   ```bash
   mongo
   # or
   mongosh
   ```
   You should see the MongoDB shell.

4. **Configure backend:**
   ```bash
   cd backend
   
   # The .env file is already configured for local MongoDB:
   # MONGODB_URI=mongodb://localhost:27017/goal-tracker
   # PORT=3000
   
   # Install dependencies
   npm install
   
   # Start server
   npm start
   ```

#### Option B: MongoDB Atlas (Cloud)

1. **Create account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a cluster:**
   - Choose FREE tier (M0)
   - Select a region close to you
   - Click "Create Cluster"

3. **Setup database access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Set role to "Atlas Admin"

4. **Setup network access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (for development)

5. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

6. **Update backend .env:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/goal-tracker?retryWrites=true&w=majority
   PORT=3000
   ```

7. **Start backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

### Frontend Setup (Detailed)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Find your IP address:**
   
   **macOS/Linux:**
   ```bash
   ifconfig | grep "inet "
   # Look for something like: inet 192.168.1.100
   ```
   
   **Windows:**
   ```bash
   ipconfig
   # Look for IPv4 Address under your active network adapter
   ```

3. **Update API URL:**
   
   Edit `frontend/services/api.js`:
   ```javascript
   // Change this line:
   const API_URL = 'http://localhost:3000/api';
   
   // To your IP address:
   const API_URL = 'http://192.168.1.100:3000/api';
   ```

4. **Start Expo:**
   ```bash
   npm start
   ```

5. **Run on device:**
   - Make sure your phone and computer are on the **same WiFi network**
   - Open Expo Go app
   - Scan the QR code
   - Wait for app to load

### Building Standalone Apps (Optional)

#### For Testing (APK/IPA)

```bash
# Login to Expo
eas login

# Configure EAS (first time only)
cd frontend
eas build:configure

# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development
```

The build will be available in your Expo dashboard.

#### For Production

```bash
# Production builds
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## 🧪 Testing the App

### Manual Test Checklist

1. **Create a Discrete Goal:**
   - Tap the + button
   - Enter title: "Complete React Course"
   - Select "Discrete" type
   - Add sub-items:
     - Checkbox: "Watch all videos"
     - Progress: "Complete exercises" (target: 20)
   - Choose a color
   - Set priority to 3
   - Save

2. **Create a Continuous Goal:**
   - Tap the + button
   - Enter title: "Daily Exercise"
   - Select "Continuous" type
   - Choose "Daily" reset frequency
   - Add sub-items:
     - Checkbox: "Morning run"
     - Progress: "Push-ups" (target: 50)
   - Save

3. **Test Interactions:**
   - Tap a goal to expand it
   - Check off checkbox items (confetti should appear! 🎉)
   - Tap edit icon on progress bar
   - Update progress value
   - Long-press goals to reorder them
   - Long-press sub-items to reorder within a goal

4. **Test Editing:**
   - Expand a goal
   - Tap "Edit Goal" button
   - Change title, color, or priority
   - Add/remove sub-items
   - Save changes

5. **Test Deletion:**
   - Edit a goal
   - Scroll down
   - Tap "Delete Goal"
   - Confirm deletion

6. **Test Notifications:**
   - Wait until 8 AM (or change the time in backend server.js)
   - Or trigger manually:
     ```bash
     curl -X POST http://localhost:3000/api/test-notification
     ```
   - Check if notification appears

## 🐛 Common Issues & Solutions

### Backend Issues

#### ❌ "MongoNetworkError: failed to connect to server"

**Solution:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# If not running, start it:
brew services start mongodb-community
# or
sudo systemctl start mongod
```

#### ❌ "Error: listen EADDRINUSE: address already in use :::3000"

**Solution:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in .env:
PORT=3001
```

### Frontend Issues

#### ❌ "Network request failed" or API not connecting

**Solutions:**
1. Check backend is running: `curl http://localhost:3000/api/health`
2. Verify API_URL uses your computer's IP, not "localhost"
3. Ensure phone and computer are on **same WiFi network**
4. Check firewall isn't blocking the connection
5. Try restarting both backend and frontend

#### ❌ Notifications not working

**Solutions:**
1. Use a **physical device** (simulators don't support push notifications)
2. Check notification permissions in device settings
3. Verify backend is logging push tokens
4. Check backend logs for push notification errors

#### ❌ Confetti not appearing

**Solutions:**
1. Make sure you're checking an item (not just opening the modal)
2. Check console for errors
3. Restart the app with cache cleared: `expo start --clear`

#### ❌ Drag & drop not working

**Solutions:**
1. Make sure you're **long-pressing** (not just tapping)
2. Clear cache and restart: `expo start --clear`
3. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

### General Issues

#### ❌ "Unable to resolve module"

**Solution:**
```bash
# Clear all caches
watchman watch-del-all
rm -rf node_modules
rm package-lock.json
npm install
expo start --clear
```

#### ❌ App crashes on startup

**Solution:**
1. Check terminal for error messages
2. Clear cache: `expo start --clear`
3. Check API_URL is correctly set
4. Verify backend is running

## 📱 Development Workflow

### Daily Development

1. **Start backend:**
   ```bash
   cd backend
   npm run dev  # Uses nodemon for auto-reload
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Make changes:**
   - Edit code in your editor
   - Save file
   - App automatically reloads
   - Shake device to open dev menu

### Testing Changes

1. **Backend changes:**
   - Server auto-reloads with nodemon
   - Test endpoints with cURL or Postman

2. **Frontend changes:**
   - Fast Refresh automatically updates
   - Or press `r` in terminal to reload
   - Or shake device → "Reload"

## 🚀 Next Steps

Now that your app is running:

1. **Customize the theme** in `frontend/theme.js`
2. **Add new features** to suit your needs
3. **Deploy backend** to Heroku, Railway, or DigitalOcean
4. **Build standalone apps** for easier distribution
5. **Submit to app stores** (optional)

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [MongoDB Guides](https://docs.mongodb.com/guides/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## 💬 Getting Help

If you encounter issues:

1. Check this setup guide
2. Read the troubleshooting section
3. Check the README files in backend/ and frontend/
4. Google the specific error message
5. Check Expo forums and Stack Overflow

## ✅ Success Checklist

You've successfully set up the app when:

- [ ] Backend server runs without errors
- [ ] MongoDB connection succeeds
- [ ] Frontend builds successfully
- [ ] App opens on your device
- [ ] You can create goals
- [ ] You can add sub-items
- [ ] Confetti appears when checking items
- [ ] Drag & drop works for reordering
- [ ] Notifications are received

**Congratulations! You're ready to track your goals! 🎯**
