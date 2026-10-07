// Publish/subscribe
// Publisher sends a message
// Subscriber listens and receives the message
// "Channel" is the topic name both sides use
// Pub/sub does not stores messages permanently

import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const channel = 'demo:notifications';

async function run() {
  // Needs two clients
  // One will publish, the other one will subscribe
  const publisher = createClient({ url: redisUrl });
  const subscriber = createClient({ url: redisUrl });

  await publisher.connect();
  await subscriber.connect();

  console.log('Publisher connected!');
  console.log('Subscriber connected!');
  console.log('Publisher PING: ', await publisher.ping());
  console.log('Subscriber only listens');

  // Subscriber must be active before any publishing is done
  await subscriber.subscribe(channel, (message) => {
    const data = JSON.parse(message);
    console.log('Subscriber received.');
    console.log('Title: ', data.title);
    console.log('Message: ', data.message);
  });

  console.log('Subscribe to channel: ', channel);
  console.log('Publish is now sending events');

  const event = {
    title: 'redis course',
    message: 'pub/sub demo'
  }

  const receivers = await publisher.publish(channel, JSON.stringify(event));
  console.log('Published event');
  console.log('Active subscribers: ', receivers);

  //await new Promise((resolve) => setTimeout(resolve, 300));

  await subscriber.unsubscribe(channel);
  await subscriber.quit();
  await publisher.quit();

  console.log('Pub/sub demo done');
}

run().catch((error) => {
  console.error('Pub/sub demo failed: ', error);
  process.exit(1);
});
