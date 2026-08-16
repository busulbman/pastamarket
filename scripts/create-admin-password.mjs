#!/usr/bin/env node
/**
 * Panel yöneticisi için bcrypt parola hash'i üretir.
 *
 * Parola:
 *  - terminalde gösterilmez (echo kapalı),
 *  - hiçbir dosyaya yazılmaz,
 *  - argüman olarak alınmaz (kabuk geçmişine düşmesin diye),
 *  - loglanmaz.
 *
 * Yalnızca üretilen hash ekrana yazılır; istenirse .env.local dosyasına
 * ADMIN_PASSWORD_HASH olarak eklenir.
 *
 * Kullanım: npm run admin:create-password
 */
import readline from "node:readline";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Writable } from "node:stream";
import bcrypt from "bcryptjs";

const ROUNDS = 12;
const MIN_LENGTH = 10;
const ENV_FILE = path.join(process.cwd(), ".env.local");

/** Girilen karakterleri ekrana basmayan gizli soru. */
function askHidden(question) {
  return new Promise((resolve, reject) => {
    let muted = false;
    const mutedOut = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) process.stdout.write(chunk, encoding);
        callback();
      },
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutedOut,
      terminal: true,
    });

    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    rl.on("error", reject);
    muted = true;
  });
}

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** .env değerindeki "$" karakterlerini kaçırır (dotenv genişletmesini engeller). */
const escapeEnvValue = (value) => value.replaceAll("$", "\\$");

/** .env.local içinde anahtarı günceller veya ekler. Parola asla yazılmaz. */
function upsertEnv(key, value) {
  let content = "";
  if (fs.existsSync(ENV_FILE)) content = fs.readFileSync(ENV_FILE, "utf8");

  // bcrypt hash'i "$" içerir. Next.js .env dosyalarını dotenv-expand ile
  // işlediği için kaçışsız "$2b" bir değişken sanılır ve değer bozulur.
  // Bu yüzden "$" karakterleri \$ olarak kaçırılır.
  const line = `${key}='${escapeEnvValue(value)}'`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(content)) content = content.replace(pattern, line);
  else content = content.replace(/\n*$/, "\n") + line + "\n";

  fs.writeFileSync(ENV_FILE, content, { mode: 0o600 });
}

async function main() {
  console.log("PastaMarket — panel yöneticisi parola hash'i\n");

  if (!process.stdin.isTTY) {
    console.error(
      "Bu script etkileşimli bir terminal gerektirir (parola gizli okunur).",
    );
    process.exit(1);
  }

  const password = await askHidden("Yeni panel parolası: ");
  if (password.length < MIN_LENGTH) {
    console.error(`\nParola en az ${MIN_LENGTH} karakter olmalıdır.`);
    process.exit(1);
  }

  const confirm = await askHidden("Parolayı tekrar girin: ");
  if (password !== confirm) {
    console.error("\nParolalar eşleşmedi.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, ROUNDS);
  const secret = crypto.randomBytes(32).toString("hex");

  console.log("\nHash oluşturuldu. Aşağıdaki satırları .env.local dosyasına ekleyin:\n");
  console.log(`ADMIN_PASSWORD_HASH='${escapeEnvValue(hash)}'`);
  console.log(`ADMIN_SESSION_SECRET='${secret}'`);
  console.log(
    "\nNOT: Hash içindeki \\$ kaçışları bilerek konulmuştur. Kaçış olmadan\n" +
      "Next.js .env okurken $ ile başlayan bölümleri değişken sanar ve giriş çalışmaz.",
  );

  const answer = await ask(
    "\nBu değerler .env.local dosyasına yazılsın mı? (e/H) ",
  );

  if (answer.toLowerCase() === "e") {
    upsertEnv("ADMIN_PASSWORD_HASH", hash);
    if (!process.env.ADMIN_SESSION_SECRET) upsertEnv("ADMIN_SESSION_SECRET", secret);
    console.log(`\n${ENV_FILE} güncellendi (yalnızca hash yazıldı, parola değil).`);
    console.log("ADMIN_EMAIL değerini de bu dosyada tanımlamayı unutmayın.");
  } else {
    console.log("\nDeğerler yazılmadı. Yukarıdaki satırları .env.local içine ekleyin.");
  }

  console.log("\nDeğişikliğin geçerli olması için dev sunucusunu yeniden başlatın.");
}

main().catch(() => {
  // Hata mesajında parola veya hash bilgisi gösterilmez.
  console.error("Beklenmeyen bir hata oluştu.");
  process.exit(1);
});
