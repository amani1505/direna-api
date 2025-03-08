import { Session, SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string; // Define the properties you store in the session
  }
}

declare module 'express' {
  interface Request {
    session: Session & Partial<SessionData>; // Add session to the Request type
  }
}
