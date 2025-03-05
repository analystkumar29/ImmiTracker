import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import applicationRoutes from './routes/application.routes';
import authRoutes from './routes/auth.routes';
import programRoutes from './routes/program.routes';
import programsRouter from './routes/programs';
import milestoneRoutes from './routes/milestone.routes';
import { errorHandler } from './middleware/errorHandler';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

// Initialize Express app
const app = express();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/programs', programsRouter);
app.use('/api/milestones', milestoneRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = Number(process.env.PORT) || 3000;
const MAX_PORT_ATTEMPTS = 10;

const startServer = (port: number, attempt = 1) => {
  if (attempt > MAX_PORT_ATTEMPTS) {
    console.error(`Failed to find an available port after ${MAX_PORT_ATTEMPTS} attempts.`);
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
    // Write the port to a file that the client can read
    try {
      const portFilePath = path.resolve(__dirname, '..', '..', '..', 'client', 'server-port.json');
      
      // Create the directory if it doesn't exist
      const dirPath = path.dirname(portFilePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      }
      
      fs.writeFileSync(portFilePath, JSON.stringify({ port }), 'utf8');
      console.log(`Server port ${port} written to ${portFilePath}`);
    } catch (error) {
      console.error('Failed to write server port to file:', error);
    }
  }).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1, attempt + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT); 