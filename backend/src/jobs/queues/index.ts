import { Queue } from 'bullmq'
import { redis } from '../../config/redis.js'

const connection = { url: process.env.UPSTASH_REDIS_URL! }

export const emailQueue = new Queue('email', { connection })
export const notificationsQueue = new Queue('notifications', { connection })
export const remindersQueue = new Queue('reminders', { connection })

export const queues = {
  email: emailQueue,
  notifications: notificationsQueue,
  reminders: remindersQueue,
}
