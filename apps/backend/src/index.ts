import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/aws-lambda'
import authApp from './account/auth'
import usersApp from './users'
import snippetsApp from './snippets'
import meApp from './me'
import investApp from './invest'
import jwt from 'jsonwebtoken'

const app = new Hono()

// Middleware to verify JWT token from cookie
export const authMiddleware = async (c: any, next: any) => {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    let token = c.req.header('Cookie')?.split('; ').find((s: string) => s.startsWith('token='))?.split('=')[1]

    if (!token) {
        const authHeader = c.req.header('Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]
        }
    }

    if (!token) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    try {
        jwt.verify(token, JWT_SECRET)
        await next()
    } catch (err) {
        return c.json({ error: 'Invalid token' }, 401)
    }
}

app.use('*', async (c, next) => {
    const corsMiddleware = cors({
        origin: (origin) => {
            const allowedOrigins = [
                'http://localhost:5173',
                'https://d2nybw662z7eao.cloudfront.net',
                'http://lambda-node-hono.s3-website-us-west-2.amazonaws.com',
                'https://gjqvt44n0m.execute-api.us-west-2.amazonaws.com' // API Gateway itself if needed
            ]
            return allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
        },
        credentials: true,
        allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposeHeaders: ['Set-Cookie']
    })
    return corsMiddleware(c, next)
})


// --- Auth Routes ---
app.route('/auth', authApp)

// --- Protected Routes ---
app.use('/users/*', authMiddleware)
app.use('/snippets/*', authMiddleware)
app.use('/me', authMiddleware)
app.use('/invest', authMiddleware)

app.route('/users', usersApp)
app.route('/snippets', snippetsApp)
app.route('/me', meApp)
app.route('/invest', investApp)

export const handler = handle(app)
