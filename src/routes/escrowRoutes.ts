import { Router } from "express";

import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { handleCreateEscrowTransaction, handleDisputeEscrow, handleFundEscrowTransaction, handleMarkAsDelivered, handleReleaseEscrow } from "../controllers/escrow.controller";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/",
  authenticateJWT,
  authorize([Role.BUYER]),
  handleCreateEscrowTransaction
);

router.post(
  "/:id/fund",
  authenticateJWT,
  authorize([Role.BUYER]),
  handleFundEscrowTransaction
);

router.post(
  "/:id/deliver",
  authenticateJWT,
  authorize([Role.SELLER]),
  handleMarkAsDelivered
);

router.post(
  "/:id/release",
  authenticateJWT,
  authorize([Role.BUYER]),
  handleReleaseEscrow
);

router.post(
  "/:id/dispute",
  authenticateJWT,
  authorize([Role.BUYER, Role.SELLER]),
  handleDisputeEscrow
);

export default router;