import dotenv from 'dotenv';
import { createClient } from 'redis';
import { redisClient } from '../redis/client';

const notificationChannel = 'notifications';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export async function publishNotification(notification: NotificationPayload): Promise<void> {
  await redisClient.publish(notificationChannel, JSON.stringify(notification));
}

const subscriberClient = createClient({ url: redisUrl });

subscriberClient.on('error', (error) => {
  console.error('Subscriber error: ', error);
});

async function startNotificationSubscriber(): Promise<void> {
  await subscriberClient.connect();

  await subscriberClient.subscribe(notificationChannel, (message) => {
    try {
      const notification = JSON.parse(message) as NotificationPayload;
      console.log('New notification received!');
      console.log('Title: ', notification.title);
      console.log('Message: ', notification.message);
      console.log('Created at: ', notification.createdAt);
    } catch (error) {
      console.error('Notification subscriber error: ', error);
    }
  });
}

startNotificationSubscriber().catch((error) => {
  console.error('Failed to start notification subscriber: ', error);
  process.exit(1);
});