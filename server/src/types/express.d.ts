import 'express';

// Extend the Express Request interface to include the user property
declare module 'express' {
  export interface Request {
    user?: {
      id: number;
    };
  }
}
