# 📚 Developer Quick Reference

## 🚀 Quick Commands

### Backend
```bash
# Setup
cd backend
npm install
npm start

# Development with auto-reload
npm run dev

# Test API
curl http://localhost:3000/api/health
curl http://localhost:3000/api/goals
```

### Frontend
```bash
# Setup
cd frontend
npm install

# Start development server
npm start

# Clear cache
expo start --clear

# Run on specific platform
expo start --android
expo start --ios
```

### Building
```bash
# Login to EAS
eas login

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

## 📱 Key File Locations

### Backend
- **Server**: `backend/server.js`
- **Models**: `backend/models/`
- **Environment**: `backend/.env`

### Frontend
- **Main App**: `frontend/App.js`
- **Screens**: `frontend/screens/`
- **Components**: `frontend/components/`
- **API Service**: `frontend/services/api.js`
- **Theme**: `frontend/theme.js`
- **Config**: `frontend/app.json`

## 🎨 Theme Colors (Quick Copy)

```javascript
// Backgrounds
background: '#F5F1E8'
cardBackground: '#FFFFFF'

// Accents
primary: '#E8B4B8'
secondary: '#B8D4E8'
accent1: '#E8D4B8'
accent2: '#D4E8B8'
accent3: '#D8B8E8'
accent4: '#E8C4B8'

// Status
success: '#A8D5BA'
warning: '#F4C47F'
error: '#E89B9B'
```

## 🔧 Common Code Snippets

### API Call (Frontend)
```javascript
import { goalAPI } from './services/api';

// Get all goals
const goals = await goalAPI.getAllGoals();

// Create goal
const newGoal = await goalAPI.createGoal({
  title: "New Goal",
  type: "discrete",
  subItems: [],
  priority: 2,
  color: "#E8B4B8"
});

// Update sub-item
await goalAPI.updateSubItem(goalId, subItemId, {
  isChecked: true
});
```

### API Endpoint (Backend)
```javascript
// Express route example
app.get('/api/custom-endpoint', async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Confetti Trigger (Frontend)
```javascript
const confettiRef = useRef(null);

// Trigger confetti
const showConfetti = () => {
  confettiRef.current?.start();
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// In render
<ConfettiCannon
  ref={confettiRef}
  count={150}
  origin={{ x: 0, y: 0 }}
  autoStart={false}
/>
```

### Animated Component
```javascript
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

// Trigger animation
scale.value = withSpring(1.2);
```

## 🐛 Debug Commands

```bash
# Clear Metro cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Clear Watchman
watchman watch-del-all

# Clear npm cache
npm cache clean --force

# Full reset
rm -rf node_modules package-lock.json
npm install
expo start --clear

# Check device logs
npx react-native log-android
npx react-native log-ios
```

## 🌐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/goal-tracker
PORT=3000
```

### Frontend (api.js)
```javascript
const API_URL = 'http://192.168.1.100:3000/api';
```

## 📝 MongoDB Commands

```bash
# Connect to database
mongosh

# Use database
use goal-tracker

# View all goals
db.goals.find().pretty()

# Count goals
db.goals.count()

# Delete all goals
db.goals.deleteMany({})

# View push tokens
db.pushtokens.find()
```

## 🔔 Notification Testing

### Send Test Notification
```bash
curl -X POST http://localhost:3000/api/test-notification
```

### Register Push Token (Frontend)
```javascript
import { notificationService } from './services/notifications';

const token = await notificationService.registerForPushNotifications();
console.log('Push token:', token);
```

## 🎯 Goal Types Reference

### Discrete Goal
```javascript
{
  type: 'discrete',
  resetFrequency: null
}
```

### Continuous Goal
```javascript
{
  type: 'continuous',
  resetFrequency: 'daily' // or 'weekly', 'monthly'
}
```

## 🏗️ Sub-Item Types

### Checkbox
```javascript
{
  id: uuid(),
  title: "Task name",
  type: "checkbox",
  isChecked: false,
  order: 0
}
```

### Progress
```javascript
{
  id: uuid(),
  title: "Progress item",
  type: "progress",
  currentValue: 5,
  targetValue: 20,
  order: 1
}
```

## 🔄 State Management Pattern

### Hook Usage
```javascript
const [goals, setGoals] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadGoals();
}, []);

const loadGoals = async () => {
  try {
    const data = await goalAPI.getAllGoals();
    setGoals(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

## 🎨 Styling Pattern

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
});
```

## 📱 Navigation

```javascript
// Navigate to screen
navigation.navigate('CreateGoal');

// Navigate with params
navigation.navigate('EditGoal', { goal });

// Go back
navigation.goBack();

// Add listener
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    // Screen focused
  });
  return unsubscribe;
}, [navigation]);
```

## 🚨 Error Handling

### Frontend
```javascript
try {
  const result = await goalAPI.createGoal(data);
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Error', 'Failed to create goal');
}
```

### Backend
```javascript
app.post('/api/goals', async (req, res) => {
  try {
    const goal = new Goal(req.body);
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ 
      error: error.message 
    });
  }
});
```

## 🔐 Security Checklist

- [ ] Environment variables for secrets
- [ ] CORS configured
- [ ] Input validation
- [ ] MongoDB injection prevention (Mongoose)
- [ ] HTTPS in production
- [ ] Rate limiting (future)
- [ ] Authentication (future)

## 📊 Performance Tips

1. **Use Native Driver**: `useNativeDriver: true` for animations
2. **Memoize Components**: `React.memo()` for expensive components
3. **Optimize FlatList**: Set `removeClippedSubviews`, `maxToRenderPerBatch`
4. **Lazy Load**: Import screens lazily if needed
5. **Index MongoDB**: Create indexes on frequently queried fields

## 🧪 Testing Checklist

- [ ] Create discrete goal
- [ ] Create continuous goal
- [ ] Add checkbox sub-items
- [ ] Add progress sub-items
- [ ] Check items (verify confetti)
- [ ] Update progress values
- [ ] Reorder goals
- [ ] Reorder sub-items
- [ ] Edit goal
- [ ] Delete goal
- [ ] Change colors
- [ ] Change priority
- [ ] Pull to refresh
- [ ] Test notifications

## 🎓 Key Libraries

### Frontend
- `expo` - App framework
- `react-navigation` - Navigation
- `react-native-reanimated` - Animations
- `react-native-gesture-handler` - Gestures
- `react-native-draggable-flatlist` - Drag & drop
- `react-native-confetti-cannon` - Confetti
- `expo-notifications` - Push notifications
- `expo-haptics` - Haptic feedback
- `axios` - HTTP client

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `node-cron` - Scheduling
- `expo-server-sdk` - Push notifications
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

## 🔗 Useful Links

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Express Docs](https://expressjs.com/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## 💡 Tips & Tricks

1. **Fast Refresh**: Press `r` in terminal to reload app
2. **Dev Menu**: Shake device to open developer menu
3. **Inspect Element**: Enable "Show Inspector" in dev menu
4. **Network Debugging**: Use React Native Debugger or Flipper
5. **MongoDB GUI**: Use MongoDB Compass for visual database management

## 📞 Support

For issues:
1. Check SETUP_GUIDE.md
2. Check README files
3. Search error in GitHub issues
4. Stack Overflow
5. Expo forums

---

**Quick Reference for Rapid Development! 🚀**
