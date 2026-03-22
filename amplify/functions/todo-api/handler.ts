import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

const TABLE = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  const method = event.requestContext.http.method;
  const user = event.requestContext?.authorizer?.jwt?.claims?.sub;
  console.log('User:', user);
  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
      body: '',
    };
  }

  try {
    switch (method) {
      case 'GET':
        const lastKey = event.queryStringParameters?.lastKey;
        const result = await db.send(
          new QueryCommand({
            TableName: TABLE,
            IndexName: 'owner-id-index', // 🔥 auto name
            KeyConditionExpression: '#owner = :owner',
            ExpressionAttributeNames: {
              '#owner': 'owner',
            },
            ExpressionAttributeValues: {
              ':owner': user,
            },
            ExclusiveStartKey: lastKey ? JSON.parse(lastKey) : undefined,
            Limit: 10, // pagination size
          })
        );

        return response(200, {
          items: result.Items,
          lastKey: result.LastEvaluatedKey,
        });

      case 'POST':
        const body = JSON.parse(event.body);

        const item = {
          id: Date.now().toString(),
          content: body.content,
          isDone: false,
          owner: user,
        };

        await db.send(
          new PutCommand({
            TableName: TABLE,
            Item: item,
          })
        );

        return response(200, item);

      case 'PUT':
        const updateBody = JSON.parse(event.body);

        if (!updateBody.id) {
          return response(400, 'Missing ID');
        }

        const updatedItem = {
          id: updateBody.id,
          content: updateBody.content,
          isDone: updateBody.isDone ?? false,
        };

        await db.send(
          new UpdateCommand({
            TableName: TABLE,
            Key: { id: updateBody.id },
            UpdateExpression: 'SET content = :content, isDone = :isDone',
            ExpressionAttributeValues: {
              ':content': updateBody.content,
              ':isDone': updateBody.isDone ?? false,
            },
          })
        );

        return response(200, updatedItem);
      case 'DELETE':
        const id = event.pathParameters.id;

        await db.send(
          new DeleteCommand({
            TableName: TABLE,
            Key: { id },
          })
        );

        return response(200, { id });

      default:
        return response(400, 'Unsupported method');
    }
  } catch (err: any) {
    return response(500, err.message);
  }
};

function response(status: number, body: any) {
  return {
    statusCode: status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}
