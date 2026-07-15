import { NextFunction, Request, Response } from 'express';
import 'dotenv/config'

function verifyBearerToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {

    console.log('res.status(401iNVALID TOKEN')
    return res.status(401).json({ error: 'No Token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (token === process.env.SHARED_PEPPER) {
        next();
    } else {
        return res.status(401).json({ error: 'Invalid token.' });
    }
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

export default verifyBearerToken;