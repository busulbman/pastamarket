#!/usr/bin/env node
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Kullanım: npm run admin:create-password -- 'en-az-12-karakterli-parola'");
  process.exit(1);
}
console.log(await bcrypt.hash(password, 12));
