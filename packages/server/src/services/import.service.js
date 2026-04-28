import fs from "fs";
import csv from "csv-parser";
import prisma from "../lib/prisma.js";

export const importService = {
  async importContactsFromCsv(filePath, userId = 1) {
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("error", (error) => reject(error))
        .on("end", async () => {
          try {
            const summary = { imported: 0, errors: 0 };

            for (const row of results) {
              const { name, phone } = row;

              if (!phone) continue;

              const jid = phone.includes("@")
                ? phone
                : `${phone}@s.whatsapp.net`;

              try {
                await prisma.contact.upsert({
                  where: { jid },
                  update: { name },
                  create: {
                    name,
                    jid,
                    userId,
                  },
                });
                summary.imported++;
              } catch (err) {
                summary.errors++;
              }
            }
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            resolve(summary);
          } catch (error) {
            reject(error);
          }
        });
    });
  },
};
