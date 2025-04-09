import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import Joi from "joi";
import { createEscrowTransaction, disputeEscrowTransaction, fundEscrowTransaction, markEscrowAsDelivered, releaseEscrowTransaction, resolveDispute } from "../services/escrow.service";

export const handleCreateEscrowTransaction = async (
  req,
  res
) => {
  const requestSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    amount: Joi.number().required(),
    sellerId: Joi.string().required(),
  })

  const { error, value } = requestSchema.validate(req.body);

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }
  
  try {
    const { title, description, amount, sellerId } = value;
    const buyerId = req.user.id;

    const escrow = await createEscrowTransaction({
      title,
      description,
      amount: parseFloat(amount),
      buyerId,
      sellerId,
    });

    return res.status(httpStatus.CREATED).json({message: "escrow transaction created", data: escrow});
  } catch (err) {
    console.error(err);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
  }
};

export const handleFundEscrowTransaction = async (
  req,
  res
) => {
  const requestSchema = Joi.object({
    id: Joi.string().required(),
  })

  const { error, value } = requestSchema.validate(req.params);

  if (error){
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }

  try {
    const { id } = value;
    const buyerId = req.user.id;

    const funded = await fundEscrowTransaction(id, buyerId);

    return res.status(httpStatus.OK).json({message: "transaction funded successfully", data: funded});
  } catch (err: any) {
    console.error(err);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: err.message || "Failed to fund transaction" });
  }
};

export const handleMarkAsDelivered = async (req, res) => {
  const requestSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { error, value } = requestSchema.validate(req.params);

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }

  try {
    const { id } = value;
    const sellerId = req.user.id;

    const delivered = await markEscrowAsDelivered(id, sellerId);

    return res.status(httpStatus.OK).json({message: "transaction delivered", data: delivered});
  } catch (err: any) {
    console.error(err);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: err.message || "Failed to mark as delivered" });
  }
};

export const handleReleaseEscrow = async (req, res) => {
  const requestSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { error, value } = requestSchema.validate(req.params);

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }

  try {
    const { id } = value;
    const buyerId = req.user.id;

    const released = await releaseEscrowTransaction(id, buyerId);

    return res.status(httpStatus.OK).json({message: "successful", data: released});
  } catch (err: any) {
    console.error(err);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: err.message || "Failed to release funds" });
  }
};

export const handleDisputeEscrow = async (req, res) => {
  const requestSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { error, value } = requestSchema.validate(req.params);

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }

  try {
    const { id } = value;
    const userId = req.user.id;
    const { reason } = req.body;

    const disputed = await disputeEscrowTransaction(id, userId, reason);

    return res.status(httpStatus.OK).json(disputed);
  } catch (err: any) {
    console.error(err);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: err.message || "Failed to dispute transaction" });
  }
};

export const handleResolveDispute = async (req, res) => {
  const requestSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { error, value } = requestSchema.validate(req.params);

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }

  try {
    const { id } = value;
    const adminId = req.user.id;
    const { winner, notes } = req.body;

    if (!["BUYER", "SELLER"].includes(winner)) {
      return res.status(400).json({ message: "Invalid winner" });
    }

    const resolved = await resolveDispute(id, adminId, winner, notes);

    return res.status(httpStatus.OK).json(resolved);
  } catch (err: any) {
    console.error(err);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: err.message || "Failed to resolve dispute" });
  }
};