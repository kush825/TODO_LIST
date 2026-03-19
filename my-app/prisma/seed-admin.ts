import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@example.com'
    const adminPassword = 'adminPassword123'
    const adminName = 'System Admin'

    // 1. Ensure Admin role exists
    let adminRole = await prisma.roles.findUnique({
        where: { RoleName: 'Admin' }
    })

    if (!adminRole) {
        adminRole = await prisma.roles.create({
            data: { RoleName: 'Admin' }
        })
        console.log('Created Admin role')
    }

    // 2. Create Admin user
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

    const user = await prisma.users.upsert({
        where: { Email: adminEmail },
        update: {
            PasswordHash: hashedAdminPassword,
            UserName: adminName
        },
        create: {
            Email: adminEmail,
            UserName: adminName,
            PasswordHash: hashedAdminPassword,
        }
    })

    // 3. Assign Admin role to user
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

    console.log('----------------------------------------')
    console.log('Admin User Created Successfully!')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('----------------------------------------')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
