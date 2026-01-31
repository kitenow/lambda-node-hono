import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-west-2',
    endpoint: process.env.DYNAMO_ENDPOINT || undefined, // For local dev
})

export const dynamo = DynamoDBDocumentClient.from(client)
export const TABLE_NAME = process.env.DYNAMODB_TABLE || 'backend-dev'
