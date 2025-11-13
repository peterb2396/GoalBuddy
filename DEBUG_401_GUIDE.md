# 🚨 Still Getting 401 Errors? Follow These Steps

## Step 1: Test Backend Auth (5 minutes)

First, let's verify the backend is working:

```bash
cd backend

# Install axios if you haven't
npm install axios

# Run the test script
node test-auth.js
```

**Expected output:**
```
🧪 Starting authentication tests...
📝 Test 1: Registering new user...
✅ Registration successful!
Token received: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Token format is correct
👤 Test 3: Getting user profile with token...
✅ Profile fetched successfully!
📋 Test 4: Creating a goal...
✅ Goal created successfully!
🎉 All tests passed! Authentication is working correctly.
```

### ❌ If the test fails:

**Error: "connect ECONNREFUSED"**
→ Backend isn't running. Start it: `npm start`

**Error: "Invalid token"**
→ Check your `.env` file has `JWT_SECRET` set

**Error: "MongoDB connection error"**
→ Start MongoDB: `mongod` or `brew services start mongodb-community`

## Step 2: Check Your .env File

```bash
cd backend
cat .env
```

**Must have:**
```env
JWT_SECRET=your-super-secret-key-change-in-production
MONGODB_URI=mongodb://localhost:27017/goals-app
PORT=3000
```

**If missing or different:**
1. Copy from `.env.example`
2. Set a JWT_SECRET (any random string)
3. **Restart the backend server**
4. Clear old tokens in the app

## Step 3: Check Frontend Configuration

Open `frontend/services/api.js` and verify:

```javascript
const API_URL = 'http://YOUR_IP_HERE:3000/api';
```

**Common mistakes:**
- ❌ `localhost:3000` (won't work on physical device)
- ❌ `127.0.0.1:3000` (won't work on physical device)
- ✅ `192.168.1.X:3000` (your computer's IP)
- ✅ `10.0.2.2:3000` (if using Android emulator)

**Find your IP:**
- Mac: System Preferences → Network
- Windows: `ipconfig` in cmd
- Linux: `ifconfig` or `ip addr`

## Step 4: Clear All Cached Data

### On Physical Device:
**iOS:**
1. Delete the app
2. Reinstall
3. Try again

**Android:**
1. Settings → Apps → Your App
2. Clear Storage & Cache
3. Try again

### On Emulator:
```bash
# In app, run this in console or add a button
AsyncStorage.clear();
```

## Step 5: Fresh Registration Test

1. **Start backend** and watch console
2. **Start frontend** and watch console
3. **Register** a NEW account (new email)
4. Watch both consoles

### Backend should show:
```
📝 Registration attempt for: test@example.com
✅ User created: 673389a5b8f2c3d4e5f6
🔑 Token generated for user: 673389a5b8f2c3d4e5f6
```

### Frontend should show:
```
📡 API Request to: /auth/register
✅ API Response: /auth/register 201
Loading stored auth...
✅ Auth restored from storage
```

### Then when accessing goals:
```
📡 API Request to: /goals
🔑 Token found: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ Authorization header set
✅ API Response: /goals 200
```

## Step 6: Use Debug Screen (Advanced)

Add the debug screen to your app:

```javascript
// In App.js navigation
import DebugScreen from './screens/DebugScreen';

// Add to stack
<Stack.Screen name="Debug" component={DebugScreen} />

// Navigate to it from anywhere
navigation.navigate('Debug');
```

**Run these tests:**
1. Test Stored Token → Should show token exists
2. Test Context → Should show token in context
3. Test /auth/me → Should succeed
4. Test /goals → Should succeed

**If any fail**, screenshot the logs and share them.

## Step 7: Common Issues & Solutions

### Issue: "No token in storage"

**Cause:** Token not saved during login/register

**Fix:**
```javascript
// Check AuthContext.js login function
await AsyncStorage.setItem('authToken', newToken);
await AsyncStorage.setItem('user', JSON.stringify(newUser));
console.log('✅ Token saved:', newToken.substring(0, 30));
```

### Issue: "Token found but still 401"

**Cause:** JWT_SECRET mismatch

**Fix:**
1. Stop backend
2. Delete `backend/.env`
3. Create new one with same JWT_SECRET
4. Start backend
5. Clear app data
6. Register new account

### Issue: "Authorization header not set"

**Cause:** Interceptor not running

**Fix:**
1. Check api.js has the interceptor
2. Make sure AsyncStorage import is correct
3. Try using expo-secure-store instead

### Issue: Backend shows "No authorization header"

**Cause:** Token not being sent

**Check these in order:**
1. Is token in AsyncStorage? → Test Stored Token
2. Is interceptor adding it? → Check api.js logs
3. Is request going to right URL? → Check API_URL
4. Is backend receiving it? → Check backend logs

## Step 8: Nuclear Option (Last Resort)

If nothing else works:

```bash
# 1. Delete everything
rm -rf frontend/node_modules backend/node_modules
rm -rf frontend/package-lock.json backend/package-lock.json

# 2. Fresh install
cd backend && npm install
cd ../frontend && npm install

# 3. Clear all data
# Delete app from device/emulator

# 4. Drop database
mongo
use goals-app
db.dropDatabase()

# 5. Fresh start
cd backend && npm start
cd frontend && npm start

# 6. Register brand new account
```

## What to Share If Still Broken

If you're STILL getting 401s after all this, share:

1. **Backend console output** (during registration and first API call)
2. **Frontend console output** (during registration and first API call)
3. **Your .env file** (hide the JWT_SECRET value)
4. **Screenshot of Debug Screen** results
5. **API_URL** from api.js
6. **Device type** (iOS/Android, emulator/physical)

## Quick Checklist

Before asking for help, verify:

- [ ] Backend is running and responding
- [ ] MongoDB is connected
- [ ] .env file exists with JWT_SECRET
- [ ] API_URL points to your computer's IP (not localhost)
- [ ] test-auth.js passes all tests
- [ ] Fresh registration (new email)
- [ ] App data cleared
- [ ] Both console logs are visible

---

**Most common cause:** JWT_SECRET mismatch or old cached tokens

**Solution:** Clear app data, restart backend, register new account

Let me know which step fails and I'll help you debug further!
