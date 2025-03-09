import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  auth?: {
    authenticated: boolean;
  };
}

export const authMiddleware = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): void => {
  // Get the authorization header
  const authHeader = req.header('Authorization');

  // Check if the Authorization header exists and has the correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
    return;
  }

  // Extract the token
  const token = authHeader.split(' ')[1];

  // Verify the token (comparing with the one in environment variables)
  const validToken = process.env.API_TOKEN;

  if (!validToken || token !== validToken) {
    res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
    return;
  }

  // If the token is valid, mark the request as authenticated
  req.auth = { authenticated: true };
  
  // Continue with the request
  next();
};