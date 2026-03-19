import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const roles = ['Admin', 'ProjectManager', 'TeamMember', 'Viewer']

    console.log('--- Ensuring Roles Exist ---')
    for (const roleName of roles) {
        await prisma.roles.upsert({
            where: { RoleName: roleName },
            update: {},
            create: { RoleName: roleName },
        })
    }

    const hashedPassword = await bcrypt.hash('password123', 10)

    const exampleUsers = [
        { name: 'Bob Manager', email: 'bob@example.com', role: 'ProjectManager' },
        { name: 'Charlie Team', email: 'charlie@example.com', role: 'TeamMember' },
    ]

    console.log('--- Creating Requested Users ---')

    for (const u of exampleUsers) {
        // Create or update user
        const user = await prisma.users.upsert({
            where: { Email: u.email },
            update: {
                PasswordHash: hashedPassword,
                UserName: u.name
            },
            create: {
                UserName: u.name,
                Email: u.email,
                PasswordHash: hashedPassword,
            },
        })

        // Get Role
        const role = await prisma.roles.findUnique({ where: { RoleName: u.role } })

        if (role) {
            // Check if user already has this role to avoid unique constraint error
            const existingMapping = await prisma.userroles.findFirst({
                where: {
                    UserID: user.UserID,
                    RoleID: role.RoleID
                }
            })

            if (!existingMapping) {
                await prisma.userroles.create({
                    data: {
                        UserID: user.UserID,
                        RoleID: role.RoleID
                    }
                })
            }
            console.log(`Successfully setup ${u.role}:`)
            console.log(`- Email: ${u.email}`)
            console.log(`- Password: password123`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
