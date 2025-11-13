// src/config/redis.ts
import { createClient } from "redis";
import "dotenv/config";

// En producción (Railway), usa REDIS_URL interna
// En desarrollo local, necesitas REDIS_PUBLIC_URL
const redisUrl = process.env.REDIS_PUBLIC_URL || process.env.REDIS_URL;

console.log("🔗 Conectando a Redis...");
// Solo para debug (oculta la contraseña)
console.log("URL:", redisUrl?.replace(/:[^:]*@/, ':****@'));

const redisClient = createClient({
  url: redisUrl as string,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("❌ Demasiados intentos de reconexión a Redis");
        return new Error("Reconexión fallida");
      }
      console.log(`🔄 Reintento ${retries}/10 en ${retries * 500}ms`);
      return retries * 500;
    },
    connectTimeout: 10000, // 10 segundos
  },
});

redisClient.connect();
redisClient.on("error", (err) => {
  console.error("❌ Error de Redis:", err);
});

redisClient.on("connect", () => {
  console.log("🔄 Conectando a Redis...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis conectado y listo");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Reconectando a Redis...");
});

redisClient.on("end", () => {
  console.log("🔌 Conexión a Redis cerrada");
});

export default redisClient;