import Cryptr from "cryptr";

const cryptr = new Cryptr(process.env.ENCRYPTION_KEY || "my-secure-key");

export const encrypt = (text: string): string => {
  return cryptr.encrypt(text);
};

export const decrypt = (encryptedText: string): string => {
  return cryptr.decrypt(encryptedText);
};