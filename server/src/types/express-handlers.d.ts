import 'express';

declare global {
  namespace ExpressJsTypes {
    import { Request, Response, NextFunction } from 'express';
    
    export type ExpressHandler = (
      req: Request,
      res: Response,
      next?: NextFunction
    ) => any;
  }
}
