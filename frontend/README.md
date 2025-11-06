# Goal Tracker Frontend

Beautiful React Native mobile application for tracking goals and habits, built with Expo.

## Features

- 🎨 **Modern UI**: Elegant beige and white theme with colorful accents
- ✨ **Smooth Animations**: Animated checkboxes, progress bars, and confetti celebrations
- 🎯 **Drag & Drop**: Reorder goals and sub-items with intuitive gestures
- 📱 **Push Notifications**: Daily reminders for your prioritized goals
- 🔄 **Real-time Sync**: Seamless backend integration
- 💫 **Haptic Feedback**: Tactile responses for better UX

## Installation

### Prerequisites

- Node.js 16+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo Go app on your mobile device (for development)

### Setup Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Configure API URL:**

Edit `services/api.js` and update the API URL:
```javascript
// For local development, use your computer's IP address
const API_URL = 'http://192.168.1.100:3000/api';

// Find your IP:
// macOS/Linux: ifconfig | grep "inet "
// Windows: ipconfig
```

3. **Start development server:**
```bash
npm start
```

4. **Run on device:**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android / `i` for iOS simulator

## Project Structure

```
frontend/
├── components/
│   ├── AnimatedCheckbox.js      # Animated checkbox with spring effect
│   ├── AnimatedProgressBar.js   # Gradient progress bar component
│   ├── SubItemCard.js           # Sub-item display (checkbox/progress)
│   └── GoalCard.js              # Main goal card with expand/collapse
│
├── screens/
│   ├── HomeScreen.js            # Goal list with drag-drop
│   ├── CreateGoalScreen.js      # New goal creation form
│   └── EditGoalScreen.js        # Goal editing and deletion
│
├── services/
│   ├── api.js                   # Backend API client
│   └── notifications.js         # Push notification service
│
├── theme.js                     # App theme configuration
├── App.js                       # Main app with navigation
├── app.json                     # Expo configuration
├── eas.json                     # EAS build configuration
└── package.json
```

## Building & Deployment

### EAS Build Setup

1. **Login to Expo:**
```bash
eas login
```

2. **Configure project:**
```bash
eas build:configure
```

3. **Update app.json** with your project details:
```json
{
  "expo": {
    "name": "Goal Tracker",
    "slug": "goal-tracker-app",
    "ios": {
      "bundleIdentifier": "com.yourcompany.goaltracker"
    },
    "android": {
      "package": "com.yourcompany.goaltracker"
    }
  }
}
```

### Android Build

**Development APK:**
```bash
eas build --platform android --profile development
```

**Production APK:**
```bash
eas build --platform android --profile production
```

**Install on device:**
```bash
adb install app-release.apk
```

### iOS Build

**Development build:**
```bash
eas build --platform ios --profile development
```

**Production build:**
```bash
eas build --platform ios --profile production
```

**TestFlight:**
```bash
eas submit --platform ios
```

## Components Guide

### AnimatedCheckbox

Smooth checkbox with spring animation and rotation effects.

```javascript
import AnimatedCheckbox from './components/AnimatedCheckbox';

<AnimatedCheckbox
  checked={item.isChecked}
  onPress={handleToggle}
  color="#E8B4B8"
  size={28}
/>
```

Props:
- `checked` (boolean): Checkbox state
- `onPress` (function): Toggle callback
- `color` (string): Accent color
- `size` (number): Checkbox size in pixels

### AnimatedProgressBar

Gradient progress bar with smooth animations.

```javascript
import AnimatedProgressBar from './components/AnimatedProgressBar';

<AnimatedProgressBar
  current={15}
  target={20}
  color="#E8B4B8"
  height={24}
/>
```

Props:
- `current` (number): Current value
- `target` (number): Target value
- `color` (string): Progress color
- `height` (number): Bar height

### SubItemCard

Displays individual sub-items with checkbox or progress.

```javascript
import SubItemCard from './components/SubItemCard';

<SubItemCard
  item={subItem}
  goalColor="#E8B4B8"
  onUpdate={handleUpdate}
  onShowConfetti={handleConfetti}
/>
```

### GoalCard

Main goal card with collapsible sub-items.

```javascript
import GoalCard from './components/GoalCard';

<GoalCard
  goal={goal}
  onPress={handleGoalPress}
  onUpdateSubItem={handleSubItemUpdate}
  onReorderSubItems={handleReorder}
  onShowConfetti={handleConfetti}
/>
```

## Screens Guide

### HomeScreen

Main screen displaying all goals with drag-and-drop support.

Features:
- Pull-to-refresh
- Drag to reorder goals
- Expand/collapse goals
- Confetti on completion
- Empty state with CTA

### CreateGoalScreen

Form for creating new goals.

Features:
- Goal title input
- Type selection (Discrete/Continuous)
- Reset frequency picker
- Color theme selector
- Priority level (0-3)
- Add sub-items (checkbox/progress)
- Sub-item management

### EditGoalScreen

Similar to CreateGoalScreen but includes:
- Pre-filled form data
- Delete goal button
- Update existing goal

## Theme Customization

Edit `theme.js` to customize colors:

```javascript
export const theme = {
  colors: {
    // Primary colors
    background: '#F5F1E8',
    cardBackground: '#FFFFFF',
    
    // Accent colors
    primary: '#E8B4B8',      // Soft pink
    secondary: '#B8D4E8',    // Soft blue
    accent1: '#E8D4B8',      // Peach
    accent2: '#D4E8B8',      // Mint
    accent3: '#D8B8E8',      // Lavender
    accent4: '#E8C4B8',      // Coral
    
    // Status colors
    success: '#A8D5BA',
    warning: '#F4C47F',
    error: '#E89B9B',
  },
  
  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999
  }
};
```

## Push Notifications

### Setup

Notifications are configured in `services/notifications.js`:

```javascript
import { notificationService } from './services/notifications';

// Register for notifications
await notificationService.registerForPushNotifications();

// Add listeners
notificationService.addNotificationListener(notification => {
  console.log('Notification received:', notification);
});
```

### Testing

Notifications only work on physical devices. To test:

1. Run app on physical device
2. Grant notification permissions
3. Backend will send daily reminders at 8 AM
4. Or trigger manually via backend API:
```bash
curl -X POST http://your-api-url/api/test-notification
```

## API Integration

### Configuration

API client is in `services/api.js`:

```javascript
import { goalAPI } from './services/api';

// Get all goals
const goals = await goalAPI.getAllGoals();

// Create goal
const newGoal = await goalAPI.createGoal(goalData);

// Update sub-item
await goalAPI.updateSubItem(goalId, subItemId, data);
```

### Available Methods

- `getAllGoals()`: Fetch all goals
- `getGoal(id)`: Get single goal
- `createGoal(data)`: Create new goal
- `updateGoal(id, data)`: Update goal
- `deleteGoal(id)`: Delete goal
- `reorderGoals(orderedIds)`: Reorder goals
- `updateSubItem(goalId, subItemId, data)`: Update sub-item
- `registerPushToken(token)`: Register push token

## Development Tips

### Clear Cache

If experiencing issues:
```bash
expo start --clear
# or
rm -rf node_modules
npm install
expo start --clear
```

### Debug API Calls

Enable axios debugging in `services/api.js`:
```javascript
api.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

api.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});
```

### Test on Multiple Devices

Expo makes it easy to test on multiple devices:
1. Start dev server: `expo start`
2. Scan QR code on all devices
3. Changes sync to all connected devices

### Hot Reload

- Shake device to open dev menu
- Enable Fast Refresh for instant updates
- Or press `r` in terminal to reload

## Troubleshooting

### Common Issues

**1. API Not Connecting**

Error: `Network request failed`

Solutions:
- Ensure backend is running
- Check API_URL uses your computer's IP (not localhost)
- Verify device and computer on same network
- Check firewall settings

**2. Notifications Not Working**

Solutions:
- Use physical device (won't work in simulator)
- Grant notification permissions in device settings
- Check backend logs for push errors
- Verify Expo push token is valid

**3. Drag & Drop Not Working**

Solutions:
- Ensure `react-native-gesture-handler` is installed
- Add GestureHandlerRootView in App.js
- Rebuild app after installing

**4. Confetti Not Showing**

Solutions:
- Check confettiRef is properly initialized
- Ensure ConfettiCannon is rendered
- Verify colors array is populated

### Debug Commands

```bash
# Clear Metro bundler cache
expo start --clear

# Reset all caches
watchman watch-del-all
rm -rf node_modules
npm install
expo start --clear

# Check device logs
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

## Performance Optimization

### Tips

1. **Optimize FlatList:**
```javascript
<FlatList
  data={items}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={21}
/>
```

2. **Memoize Components:**
```javascript
const GoalCard = React.memo(({ goal }) => {
  // Component code
});
```

3. **Use Native Driver:**
```javascript
Animated.timing(value, {
  toValue: 1,
  useNativeDriver: true
}).start();
```

## Publishing

### Expo Go (Development)

Your app is accessible via Expo Go during development:
1. Open Expo Go
2. Scan QR code
3. App updates automatically

### Standalone App (Production)

1. **Build with EAS:**
```bash
eas build --platform all --profile production
```

2. **Submit to stores:**
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

3. **Update your app:**
```bash
# Over-the-air updates (no app store review)
eas update --branch production
```

## Testing

### Manual Testing Checklist

- [ ] Create discrete goal
- [ ] Create continuous goal (daily/weekly/monthly)
- [ ] Add checkbox sub-items
- [ ] Add progress sub-items
- [ ] Check/uncheck items (confetti should appear)
- [ ] Update progress values
- [ ] Reorder goals
- [ ] Reorder sub-items within goal
- [ ] Edit goal
- [ ] Delete goal
- [ ] Change priority
- [ ] Change color theme
- [ ] Pull to refresh
- [ ] Receive notification (test at 8 AM or use test endpoint)

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## License

MIT
