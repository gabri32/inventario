// Load test environment variables before anything else
import dotenv from 'dotenv';
dotenv.config();

// Increase Jest timeout for DB operations
jest.setTimeout(15000);
