import { Request, Response, NextFunction } from 'express';
import * as notificationSubscriber from '../subscribers/notification.subscriber';

export async function publishNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const notification = {
      id: Date.now().toString(),
      title: req.body.title,
      message: req.body.message,
      createdAt: new Date().toISOString()
    }

    await notificationSubscriber.publishNotification(notification);

    res.status(201).json({
      success: true,
      message: 'Notification published successfully',
      data: {
        id: notification.id
      }
    });
  } catch (error) {
    next(error);
  }
}