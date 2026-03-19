import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const roles = ['Admin', 'ProjectManager', 'TeamMember', 'Viewer']

    for (const roleName of roles) {
        await prisma.roles.upsert({
            where: { RoleName: roleName },
            update: {},
            create: { RoleName: roleName }
        })
        console.log(`Role ensured: ${roleName}`)
    }

    console.log('RBAC Roles seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
