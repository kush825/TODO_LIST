import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function debug() {
    const email = 'admin@example.com'
    const password = 'adminPassword123'

    console.log(`Checking user: ${email}`)

    const user = await prisma.users.findUnique({
        where: { Email: email },
        include: {
            userroles: {
                include: {
                    roles: true
                }
            }
        }
    })

    if (!user) {
        console.log('USER NOT FOUND IN DB')
        return
    }

    console.log('User found:', {
        UserID: user.UserID,
        UserName: user.UserName,
        Email: user.Email,
        PasswordHash: user.PasswordHash,
        Roles: user.userroles.map(ur => ur.roles.RoleName)
    })

    const isValid = await bcrypt.compare(password, user.PasswordHash)
    console.log('Password comparison result (bcryptjs):', isValid)
}

debug()
    .finally(async () => {
        await prisma.$disconnect()
    })
