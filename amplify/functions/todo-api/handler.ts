import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

const TABLE = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  const method = event.requestContext.http.method;
  console.log('METHOD:', event.requestContext.http.method);
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
        const data = await db.send(new ScanCommand({ TableName: TABLE }));
        return response(200, data.Items);

      case 'POST':
        const body = JSON.parse(event.body);

        const item = {
          id: Date.now().toString(),
          content: body.content,
          isDone: false,
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
          new PutCommand({
            TableName: TABLE,
            Item: updatedItem,
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
