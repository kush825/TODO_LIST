import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminRole = await prisma.roles.upsert({
        where: { RoleName: 'Admin' },
        update: {},
        create: { RoleName: 'Admin' }
    })

    const usersToFix = [
        { email: 'admin@example.com', password: 'adminPassword123' },
        { email: 'admin@gmail.com', password: 'Admin@08' }
    ]

    for (const u of usersToFix) {
        const hashedPassword = await bcrypt.hash(u.password, 10)
        const user = await prisma.users.upsert({
            where: { Email: u.email },
            update: { PasswordHash: hashedPassword },
            create: {
                Email: u.email,
                UserName: u.email.split('@')[0],
                PasswordHash: hashedPassword
            }
        })

        await prisma.userroles.upsert({
            where: {
                UserID_RoleID: {
                    UserID: user.UserID,
                    RoleID: adminRole.RoleID
                }
            },
            update: {},
            create: {
                UserID: user.UserID,
                RoleID: adminRole.RoleID
            }
        })
        console.log(`Updated/Created admin user: ${u.email}`)
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
