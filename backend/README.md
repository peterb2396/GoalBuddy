# Goal Tracker Backend API

Node.js Express API with MongoDB for the Goal Tracker application.

## Features

- RESTful API for goal management
- MongoDB with Mongoose ODM
- Automatic continuous goal reset scheduling
- Push notification support via Expo
- Daily notification scheduler (8 AM)
- CORS enabled for cross-origin requests

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create or edit `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/goal-tracker
PORT=3000
```

For production with MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/goal-tracker?retryWrites=true&w=majority
PORT=3000
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Or use MongoDB Atlas** (cloud) - Update MONGODB_URI in .env

### 4. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will be available at `http://localhost:3000`

## API Endpoints

### Goals Management

#### Get All Goals
```http
GET /api/goals
```

Response:
```json
[
  {
    "_id": "...",
    "title": "Learn React Native",
    "type": "discrete",
    "subItems": [...],
    "isCompleted": false,
    "priority": 2,
    "order": 0,
    "color": "#E8B4B8",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Single Goal
```http
GET /api/goals/:id
```

#### Create Goal
```http
POST /api/goals
Content-Type: application/json

{
  "title": "Complete Course",
  "type": "discrete",
  "subItems": [
    {
      "id": "uuid-1",
      "title": "Watch videos",
      "type": "checkbox",
      "isChecked": false,
      "order": 0
    },
    {
      "id": "uuid-2",
      "title": "Practice exercises",
      "type": "progress",
      "currentValue": 5,
      "targetValue": 20,
      "order": 1
    }
  ],
  "priority": 2,
  "color": "#E8B4B8"
}
```

#### Update Goal
```http
PUT /api/goals/:id
Content-Type: application/json

{
  "title": "Updated title",
  "priority": 3
}
```

#### Delete Goal
```http
DELETE /api/goals/:id
```

#### Reorder Goals
```http
POST /api/goals/reorder
Content-Type: application/json

{
  "orderedIds": ["id1", "id2", "id3"]
}
```

### Sub-Items

#### Update Sub-Item
```http
PUT /api/goals/:goalId/subitems/:subItemId
Content-Type: application/json

{
  "isChecked": true
}
```

For progress type:
```json
{
  "currentValue": 15
}
```

### Push Notifications

#### Register Push Token
```http
POST /api/push-token
Content-Type: application/json

{
  "token": "ExponentPushToken[...]"
}
```

#### Test Notification
```http
POST /api/test-notification
```

Sends a test notification to all registered devices.

### Health Check

```http
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Data Models

### Goal Model

```javascript
{
  userId: String,              // Default: 'default-user'
  title: String,               // Required
  type: String,                // 'discrete' | 'continuous'
  resetFrequency: String,      // 'daily' | 'weekly' | 'monthly' (for continuous)
  lastResetDate: Date,         // Last time continuous goal was reset
  subItems: [{
    id: String,                // UUID
    title: String,
    type: String,              // 'checkbox' | 'progress'
    isChecked: Boolean,
    currentValue: Number,
    targetValue: Number,
    order: Number
  }],
  isCompleted: Boolean,
  priority: Number,            // 0-3
  order: Number,
  color: String,               // Hex color
  createdAt: Date,
  updatedAt: Date
}
```

### PushToken Model

```javascript
{
  userId: String,
  token: String,               // Expo push token
  createdAt: Date
}
```

## Automatic Features

### Goal Reset Scheduler

Continuous goals automatically reset based on their `resetFrequency`:
- **Daily**: Resets every day at midnight
- **Weekly**: Resets every Monday
- **Monthly**: Resets on the 1st of each month

When a goal resets:
- All checkbox sub-items are unchecked
- All progress sub-items reset to 0
- `lastResetDate` is updated
- `isCompleted` is set to false

### Daily Notifications

The server sends push notifications every day at 8:00 AM:
- Fetches top 3 prioritized goals
- Sends to all registered push tokens
- Includes goal titles and a call-to-action

To change the notification time, edit the cron schedule in `server.js`:
```javascript
// Current: 8 AM daily
cron.schedule('0 8 * * *', sendDailyNotification);

// Examples:
// 9 AM: '0 9 * * *'
// 7 PM: '0 19 * * *'
```

## Deployment

### Deploy to Heroku

1. Create a Heroku app:
```bash
heroku create your-app-name
```

2. Add MongoDB Atlas:
```bash
heroku addons:create mongolab:sandbox
```

3. Deploy:
```bash
git push heroku main
```

### Deploy to Railway

1. Connect your GitHub repository
2. Add MongoDB database
3. Set environment variables
4. Deploy automatically

### Deploy to DigitalOcean

1. Create a droplet
2. Install Node.js and MongoDB
3. Clone repository
4. Run with PM2:
```bash
npm install -g pm2
pm2 start server.js
pm2 save
```

## Testing

### Manual Testing with cURL

Create a goal:
```bash
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Goal",
    "type": "discrete",
    "subItems": []
  }'
```

Get all goals:
```bash
curl http://localhost:3000/api/goals
```

### Testing Notifications

```bash
curl -X POST http://localhost:3000/api/test-notification
```

## Troubleshooting

### MongoDB Connection Issues

**Error: `MongoNetworkError: failed to connect to server`**

Solution:
1. Ensure MongoDB is running
2. Check connection string in `.env`
3. For Atlas, ensure IP whitelist includes your IP

### Port Already in Use

**Error: `EADDRINUSE: address already in use`**

Solution:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>
```

### Notification Not Sending

1. Check that push tokens are registered:
```bash
# MongoDB shell
use goal-tracker
db.pushtokens.find()
```

2. Verify tokens are valid Expo push tokens
3. Check server logs for errors

## Development Tips

### Hot Reload

Use nodemon for automatic server restart:
```bash
npm install -g nodemon
npm run dev
```

### Database Seeding

Add sample data:
```javascript
// seed.js
const mongoose = require('mongoose');
const Goal = require('./models/Goal');

mongoose.connect('mongodb://localhost:27017/goal-tracker');

const sampleGoals = [
  {
    title: "Learn JavaScript",
    type: "discrete",
    subItems: [
      { id: "1", title: "Variables", type: "checkbox", isChecked: true, order: 0 },
      { id: "2", title: "Functions", type: "checkbox", isChecked: false, order: 1 }
    ],
    priority: 3,
    order: 0,
    color: "#E8B4B8"
  }
];

Goal.insertMany(sampleGoals)
  .then(() => {
    console.log('Sample data inserted');
    process.exit(0);
  });
```

Run: `node seed.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT
