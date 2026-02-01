import { Context, Hono } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { rateLimiter } from 'hono-rate-limiter'

import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { dynamo, TABLE_NAME } from '../dynamo/client'


const auth = new Hono()

// Rate limiter configuration: 5 attempts per 15 minutes per IP
const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-6',
    keyGenerator: (c: Context) => c.req.header('x-forwarded-for') || c.req.header('remote-addr') || 'anonymous',
    handler: (c: Context) => {
        return c.json({ error: 'Too many attempts. Please try again after 15 minutes.' }, 429)
    }

})

// Apply rate limiter to sensitive routes
auth.use('/login', limiter)
auth.use('/signup', limiter)
auth.use('/forgot-password', limiter)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Signup
auth.post('/signup', async (c) => {
    try {
        const { email, password, name } = await c.req.json()
        if (!email || !password) return c.json({ error: 'Email and password required' }, 400)

        // Check if user exists
        const existing = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        }))

        if (existing.Items && existing.Items.length > 0) {
            return c.json({ error: 'User already exists' }, 400)
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = {
            id: randomUUID(),
            type: 'USER',
            email,
            password: hashedPassword,
            name,
            createdAt: new Date().toISOString()
        }

        // Persist user to DynamoDB
        await dynamo.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: user
        }))

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' })

        const isProduction = process.env.NODE_ENV === 'production';
        setCookie(c, 'token', token, {
            httpOnly: true,
            secure: isProduction, // Set secure to true only in production
            sameSite: isProduction ? 'None' : 'Lax', // Set SameSite to 'None' in production, 'Lax' otherwise for local development
            maxAge: 3600,
            path: '/'
        })

        return c.json({ message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name } }, 201)

    } catch (error) {
        console.error(error)
        return c.json({ error: 'Signup failed' }, 500)
    }
})

// Login
auth.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json()

        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        }))

        const user = result.Items?.[0]
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return c.json({ error: 'Invalid credentials' }, 401)
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' })

        const isProduction = process.env.NODE_ENV === 'production';
        setCookie(c, 'token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 3600,
            path: '/'
        })

        return c.json({ token, user: { id: user.id, email: user.email, name: user.name } })

    } catch (error) {
        console.error(error)
        return c.json({ error: 'Login failed' }, 500)
    }
})

// Forgot Password
auth.post('/forgot-password', async (c) => {
    try {
        const { email } = await c.req.json()
        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        }))

        const user = result.Items?.[0]
        if (!user) {
            return c.json({ message: 'If email exists, a reset link was sent' })
        }

        const resetToken = randomUUID()
        const expiry = Date.now() + 3600000 // 1 hour

        await dynamo.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                id: `RESET#${resetToken}`,
                type: 'RESET_TOKEN',
                userId: user.id,
                expiry
            }
        }))

        console.log(`Reset token for ${email}: ${resetToken}`)
        return c.json({ message: 'Reset token generated', resetToken })
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Request failed' }, 500)
    }
})

// Reset Password
auth.post('/reset-password', async (c) => {
    try {
        const { token, newPassword } = await c.req.json()
        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'id = :id AND #t = :type',
            ExpressionAttributeValues: {
                ':id': `RESET#${token}`,
                ':type': 'RESET_TOKEN'
            },
            ExpressionAttributeNames: { '#t': 'type' }
        }))

        const resetData = result.Items?.[0]
        if (!resetData || resetData.expiry < Date.now()) {
            return c.json({ error: 'Invalid or expired token' }, 400)
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        const userResult = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': resetData.userId }
        }))
        const user = userResult.Items?.[0]
        if (!user) return c.json({ error: 'User not found' }, 404)

        await dynamo.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: { ...user, password: hashedPassword }
        }))

        return c.json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Reset failed' }, 500)
    }
})

// Check Session
auth.get('/me', async (c) => {
    try {
        const token = getCookie(c, 'token')
        if (!token) return c.json({ error: 'Unauthorized' }, 401)

        const payload = jwt.verify(token, JWT_SECRET) as any

        // Fetch user from DB
        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'id = :id',
            ExpressionAttributeValues: { ':id': payload.userId }
        }))

        const user = result.Items?.[0]
        if (!user) return c.json({ error: 'User not found' }, 401)

        return c.json({ user: { id: user.id, email: user.email, name: user.name } })
    } catch (error) {
        return c.json({ error: 'Invalid session' }, 401)
    }
})

// Logout
auth.post('/logout', async (c) => {
    const isProduction = process.env.NODE_ENV === 'production';
    deleteCookie(c, 'token', {
        path: '/',
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax'
    })
    return c.json({ message: 'Logged out successfully' })
})


export default auth
