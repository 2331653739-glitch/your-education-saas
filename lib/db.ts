import { PrismaClient } from '@prisma/client'

// 暴力消除法：直接告诉编辑器不要管 global 的类型
const globalForPrisma = global as any;

export const db = globalForPrisma.prisma || new PrismaClient();

// 同样暴力消除 process 的报错
if (typeof process !== 'undefined' && (process as any).env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}