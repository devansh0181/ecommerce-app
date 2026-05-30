import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  user: process.env.EMAIL_USER || 'test@gmail.com',
  password: process.env.EMAIL_PASSWORD || '',
  from: process.env.EMAIL_FROM || 'noreply@queuecut.com',
  fromName: process.env.EMAIL_FROM_NAME || 'QueueCut',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
}));