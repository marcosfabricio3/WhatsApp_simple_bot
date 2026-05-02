import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";

export const authController = {
  async register(req, res) {
    try {
      const { email, password } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "El email ya está registrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      logger.info(`Usuario registrado con éxito: ${email}`);
      res
        .status(201)
        .json({ message: "Usuario creado correctamente", userId: user.id });
    } catch (error) {
      logger.error("Error en registro:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "clave_secreta_provisional",
        { expiresIn: "24h" },
      );

      res.json({
        token,
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      logger.error("Error en login:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  },
};
