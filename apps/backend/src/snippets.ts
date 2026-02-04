import { Hono } from 'hono'
import { PutCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { dynamo, TABLE_NAME } from './dynamo/client'

const snippets = new Hono()

// GET /snippets - List all snippets
snippets.get('/', async (c) => {
    try {
        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: '#t = :type',
            ExpressionAttributeNames: { '#t': 'type' },
            ExpressionAttributeValues: { ':type': 'SNIPPET' }
        }))

        return c.json({ snippets: result.Items || [] })
    } catch (error) {
        console.error('Error fetching snippets:', error)
        return c.json({ error: 'Failed to fetch snippets' }, 500)
    }
})

// POST /snippets - Create a new snippet
snippets.post('/', async (c) => {
    try {
        const { title, code, language } = await c.req.json()
        if (!title || !code) {
            return c.json({ error: 'Title and code are required' }, 400)
        }

        const snippet = {
            id: randomUUID(),
            type: 'SNIPPET',
            title,
            code,
            language: language || 'plaintext',
            createdAt: new Date().toISOString()
        }

        await dynamo.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: snippet
        }))

        return c.json({ message: 'Snippet created successfully', snippet }, 201)
    } catch (error) {
        console.error('Error creating snippet:', error)
        return c.json({ error: 'Failed to create snippet' }, 500)
    }
})

// DELETE /snippets/:id - Delete a snippet
snippets.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id')
        await dynamo.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id }
        }))
        return c.json({ message: 'Snippet deleted successfully' })
    } catch (error) {
        console.error('Error deleting snippet:', error)
        return c.json({ error: 'Failed to delete snippet' }, 500)
    }
})

export default snippets
