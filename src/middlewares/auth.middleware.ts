import prisma from "config/db";
import jwt from "jsonwebtoken";
import httpStatus from "http-status-codes"

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateJWT = async (
  req,
  res,
  next
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};
