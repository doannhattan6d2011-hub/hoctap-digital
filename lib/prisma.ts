// Mock Prisma an toàn tuyệt đối cho môi trường Vercel Serverless
export const prisma = {
  document: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    delete: async () => ({}),
  },
  download: {
    findMany: async () => [],
    create: async () => ({}),
  },
  user: {
    findMany: async () => [],
    findUnique: async () => null,
  }
};