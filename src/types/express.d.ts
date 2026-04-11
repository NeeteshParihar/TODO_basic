
import { IPayload } from "./user.js";

declare global {
  namespace Express {
    interface Request {
      // We use 'user?' because not every request will be authenticated
      user?: IPayload;
    }
  }
}