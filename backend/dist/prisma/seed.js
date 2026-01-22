"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const alice = await prisma.user.create({
        data: { name: 'Alice Silva', email: 'alice@example.com', role: 'admin' },
    });
    const bob = await prisma.user.create({
        data: { name: 'Bob Santos', email: 'bob@example.com', role: 'user' },
    });
    const carol = await prisma.user.create({
        data: { name: 'Carol Souza', email: 'carol@example.com', role: 'user' },
    });
    const nestIntro = await prisma.training.create({
        data: { title: 'Introdução ao NestJS', durationMinutes: 45 },
    });
    const prismaBasics = await prisma.training.create({
        data: { title: 'Prisma Basics', durationMinutes: 30 },
    });
    const reactHooks = await prisma.training.create({
        data: { title: 'React Hooks Avançado', durationMinutes: 60 },
    });
    await prisma.trainingProgress.createMany({
        data: [
            { userId: alice.id, trainingId: nestIntro.id, watchedMinutes: 20 },
            { userId: alice.id, trainingId: reactHooks.id, watchedMinutes: 60 },
            { userId: bob.id, trainingId: prismaBasics.id, watchedMinutes: 30 },
            { userId: carol.id, trainingId: nestIntro.id, watchedMinutes: 45 },
        ],
    });
    await prisma.accessLog.createMany({
        data: [
            { userId: alice.id },
            { userId: alice.id },
            { userId: bob.id },
            { userId: carol.id },
            { userId: carol.id },
            { userId: carol.id },
        ],
    });
    console.log('✅ Seed concluído');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map