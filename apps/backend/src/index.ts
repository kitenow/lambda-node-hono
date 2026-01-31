import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/aws-lambda'
import authApp from './account/auth'

const app = new Hono()

app.use('*', async (c, next) => {
    const corsMiddleware = cors({
        origin: (origin) => {
            const allowedOrigins = [
                'http://localhost:5173',
                'http://lambda-node-hono.s3-website-us-west-2.amazonaws.com',
                'https://gjqvt44n0m.execute-api.us-west-2.amazonaws.com' // API Gateway itself if needed
            ]
            return allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
        },
        credentials: true,
        allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization'],
        exposeHeaders: ['Set-Cookie']
    })
    return corsMiddleware(c, next)
})


// --- Auth Routes ---
app.route('/auth', authApp)

export const handler = handle(app)
