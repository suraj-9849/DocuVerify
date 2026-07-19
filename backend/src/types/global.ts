import 'express-session';

declare module 'express' {
  interface Request {
    user?: import('@prisma/client').User;
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export {};
