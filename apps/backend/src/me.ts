import { Hono } from 'hono'
import { PutCommand, ScanCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { dynamo, TABLE_NAME } from './dynamo/client'

const me = new Hono()

// --- Bookmarks ---

me.get('/bookmarks', async (c) => {
    try {
        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: '#t = :type',
            ExpressionAttributeNames: { '#t': 'type' },
            ExpressionAttributeValues: { ':type': 'BOOKMARK' }
        }))
        return c.json({ bookmarks: result.Items || [] })
    } catch (error) {
        return c.json({ error: 'Failed to fetch bookmarks' }, 500)
    }
})

me.post('/bookmarks', async (c) => {
    try {
        const { title, url } = await c.req.json()
        const bookmark = {
            id: randomUUID(),
            type: 'BOOKMARK',
            title,
            url,
            createdAt: new Date().toISOString()
        }
        await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: bookmark }))
        return c.json({ bookmark }, 201)
    } catch (error) {
        return c.json({ error: 'Failed to create bookmark' }, 500)
    }
})

me.delete('/bookmarks/:id', async (c) => {
    try {
        const id = c.req.param('id')
        await dynamo.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }))
        return c.json({ message: 'Deleted' })
    } catch (error) {
        return c.json({ error: 'Failed to delete' }, 500)
    }
})

// --- Todos ---

me.get('/todos', async (c) => {
    try {
        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: '#t = :type',
            ExpressionAttributeNames: { '#t': 'type' },
            ExpressionAttributeValues: { ':type': 'TODO' }
        }))
        return c.json({ todos: result.Items || [] })
    } catch (error) {
        return c.json({ error: 'Failed to fetch todos' }, 500)
    }
})

me.post('/todos', async (c) => {
    try {
        const { task } = await c.req.json()
        const todo = {
            id: randomUUID(),
            type: 'TODO',
            task,
            completed: false,
            createdAt: new Date().toISOString()
        }
        await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: todo }))
        return c.json({ todo }, 201)
    } catch (error) {
        return c.json({ error: 'Failed to create todo' }, 500)
    }
})

me.put('/todos/:id', async (c) => {
    try {
        const id = c.req.param('id')
        const { completed } = await c.req.json()

        // Scan to find the item first because we need all attributes for Put (or use UpdateCommand properly)
        // For simplicity with this schema, I'll use UpdateCommand
        await dynamo.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: 'set completed = :c',
            ExpressionAttributeValues: { ':c': completed }
        }))

        return c.json({ message: 'Updated' })
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Failed to update todo' }, 500)
    }
})

me.delete('/todos/:id', async (c) => {
    try {
        const id = c.req.param('id')
        await dynamo.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }))
        return c.json({ message: 'Deleted' })
    } catch (error) {
        return c.json({ error: 'Failed to delete' }, 500)
    }
})

export default me
