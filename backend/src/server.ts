import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat';
import { optimizedChatRouter } from './routes/optimizedChat';
import { productsRouter } from './routes/products';
import { authRouter } from './routes/auth';
import { userProjectsRouter } from './routes/userProjects';
import { scanTrackingRouter } from './routes/scanTracking';
import { emailRouter } from './routes/email';
import { ordersRouter } from './routes/orders';
import pushNotificationsRouter from './routes/pushNotifications';
import cartRouter from './routes/cart';
import privacyRouter from './routes/privacy';
import registrationRouter from './routes/registration';
import { errorHandler } from './middleware/errorHandler';

// Lade .env Datei ZUERST
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'VYSN Chatbot API läuft' });
});

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/chat-fast', optimizedChatRouter); // Neue optimierte Route
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/user-projects', userProjectsRouter);
app.use('/api/scan-tracking', scanTrackingRouter);
app.use('/api/email', emailRouter); // Email-Service für Bestellungen
app.use('/api/orders', ordersRouter); // Order-Management
app.use('/api/push', pushNotificationsRouter); // Push Notifications
app.use('/api/cart', cartRouter); // Warenkorb
app.use('/api/privacy', privacyRouter); // Datenschutz
app.use('/api/registration', registrationRouter); // Custom Registration

// Error handling
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf allen Interfaces auf Port ${PORT}`);
});

export default app; 