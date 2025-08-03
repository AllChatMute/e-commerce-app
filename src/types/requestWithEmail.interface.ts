import { Request } from "express";

export interface RequestWithEmail extends Request {
  email: string;
}
