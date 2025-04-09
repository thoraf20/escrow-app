import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import httpStatus from "http-status-codes";
import Joi from "joi";
import prisma from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET!;

// User Registration
export const register = async (req, res, next) => {
  const requestSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required(),
    role: Joi.string().valid("ADMIN", "SELLER", "BUYER").required(),
  })

  const { error, value } = requestSchema.validate(req.body);

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }

  try {
    const { name, email, password, role } = value;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(httpStatus.BAD_REQUEST).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    user.password = ""; // 

    return res.status(httpStatus.CREATED).json({ message: "User registered successfully", user });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

// User Login
export const login = async (req, res, next) => {
  const requestSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  })

  const { error, value } = requestSchema.validate(req.body);

  if (error){
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }

  try {
    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};
