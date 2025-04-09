import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import httpStatus from "http-status-codes"
export const authorize =
  (roles: Role[]) => (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    if (!roles.includes(user.role)) {
      return res.status(httpStatus.FORBIDDEN).json({ message: "Forbidden: Access denied" });
    }

    next();
  };


  // sample usage
  // app.post("/escrow/create", authorize([Role.BUYER]), (req, res) => {
  //   res.json({ message: "Escrow transaction created" });
  // });