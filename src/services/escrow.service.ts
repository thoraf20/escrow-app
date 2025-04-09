import prisma from "../config/db";

export const createEscrowTransaction = async (data: {
  title: string;
  description: string;
  amount: number;
  buyerId: string;
  sellerId: string;
}) => {
  return await prisma.escrowTransaction.create({
    data: {
      title: data.title,
      description: data.description,
      amount: data.amount,
      buyerId: data.buyerId,
      sellerId: data.sellerId,
    },
  });
};

export const fundEscrowTransaction = async (id: string, buyerId: string) => {
  // Ensure only the buyer can fund it
  const transaction = await prisma.escrowTransaction.findUnique({
    where: { id },
  });

  if (!transaction) throw new Error("Transaction not found");
  if (transaction.buyerId !== buyerId) throw new Error("Unauthorized");

  return await prisma.escrowTransaction.update({
    where: { id },
    data: {
      status: "FUNDED",
    },
  });
};

export const markEscrowAsDelivered = async (id: string, sellerId: string) => {
  const transaction = await prisma.escrowTransaction.findUnique({
    where: { id },
  });

  if (!transaction) throw new Error("Transaction not found");
  if (transaction.sellerId !== sellerId) throw new Error("Unauthorized");
  if (transaction.status !== "FUNDED")
    throw new Error("Transaction must be funded before delivery");

  return await prisma.escrowTransaction.update({
    where: { id },
    data: {
      status: "DELIVERED",
    },
  });
};

export const releaseEscrowTransaction = async (id: string, buyerId: string) => {
  const transaction = await prisma.escrowTransaction.findUnique({
    where: { id },
  });

  if (!transaction) throw new Error("Transaction not found");
  if (transaction.buyerId !== buyerId) throw new Error("Unauthorized");
  if (transaction.status !== "DELIVERED")
    throw new Error(
      "Transaction must be marked as delivered before releasing funds"
    );

  return await prisma.escrowTransaction.update({
    where: { id },
    data: {
      status: "RELEASED",
    },
  });
};

export const disputeEscrowTransaction = async (
  id: string,
  userId: string,
  reason?: string
) => {
  const transaction = await prisma.escrowTransaction.findUnique({
    where: { id },
  });

  if (!transaction) throw new Error("Transaction not found");

  // Only buyer or seller can dispute
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    throw new Error("Unauthorized");
  }

  if (transaction.status !== "DELIVERED") {
    throw new Error("Only delivered transactions can be disputed");
  }

  return await prisma.escrowTransaction.update({
    where: { id },
    data: {
      status: "DISPUTED",
      disputeReason: reason,
    },
  });
};
