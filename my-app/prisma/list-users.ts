import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
    const users = await prisma.users.findMany({
        include: {
            userroles: {
                include: {
                    roles: true
                }
            }
        }
    })

    console.log('--- ALL USERS ---')
    users.forEach(u => {
        console.log({
            UserID: u.UserID,
            Email: u.Email,
            UserName: u.UserName,
            Roles: u.userroles.map(ur => ur.roles.RoleName),
            PasswordHash: u.PasswordHash
        })
    })
    console.log('-----------------')
}

listUsers()
    .finally(async () => {
        await prisma.$disconnect()
    })
