const { Expo } = require('expo-server-sdk');

const expo = new Expo();

async function sendPushNotification(pushToken, title, body, data = {}) {
  // Check if the push token is valid
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high'
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Push notification sent:', ticket);
    return ticket;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

async function sendPushNotifications(messages) {
  // Filter out invalid tokens
  const validMessages = messages.filter(msg => 
    Expo.isExpoPushToken(msg.to)
  );

  // Chunk messages for Expo API
  const chunks = expo.chunkPushNotifications(validMessages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notification chunk:', error);
    }
  }

  return tickets;
}

module.exports = {
  sendPushNotification,
  sendPushNotifications
};