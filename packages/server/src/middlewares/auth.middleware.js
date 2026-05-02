import jwt from "jsonwebtoken";
import logger from "../lib/logger.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "No autorizado. Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "clave_secreta_provisional",
    );

    req.user = decoded;

    next();
  } catch (error) {
    logger.error("Error al verificar token JWT:", error.message);
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};
