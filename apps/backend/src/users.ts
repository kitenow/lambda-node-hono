import { Hono } from 'hono'
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { dynamo, TABLE_NAME } from './dynamo/client'

const users = new Hono()

// GET /users - List all users
users.get('/', async (c) => {
    try {
        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: '#t = :type',
            ExpressionAttributeNames: { '#t': 'type' },
            ExpressionAttributeValues: { ':type': 'USER' }
        }))

        const usersList = (result.Items || []).map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            createdAt: u.createdAt
        }))

        return c.json({ users: usersList })
    } catch (error) {
        console.error('Error fetching users:', error)
        return c.json({ error: 'Failed to fetch users' }, 500)
    }
})

// POST /users - Create a new user (admin/dashboard action)
users.post('/', async (c) => {
    try {
        const { email, name } = await c.req.json()
        if (!email || !name) {
            return c.json({ error: 'Email and name are required' }, 400)
        }

        const user = {
            id: randomUUID(),
            type: 'USER',
            email,
            name,
            createdAt: new Date().toISOString()
            // Note: In a real app, you might want to send an invite or set a temporary password
        }

        await dynamo.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: user
        }))

        return c.json({ message: 'User created successfully', user }, 201)
    } catch (error) {
        console.error('Error creating user:', error)
        return c.json({ error: 'Failed to create user' }, 500)
    }
})

export default users
