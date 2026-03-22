import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { todoApi } from './functions/todo-api/resource';

// CDK imports
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const backend = defineBackend({
  auth,
  data,
  todoApi,
});

// ✅ ENV
backend.todoApi.addEnvironment(
  'TABLE_NAME',
  backend.data.resources.tables.Todo.tableName
);

// Permissions
backend.data.resources.tables.Todo.grantReadWriteData(
  backend.todoApi.resources.lambda
);

// CREATE API USING CDK
const apiStack = backend.createStack('api-stack');

const httpApi = new HttpApi(apiStack, 'TodoHttpApi', {
  corsPreflight: {
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: [
      CorsHttpMethod.GET,
      CorsHttpMethod.POST,
      CorsHttpMethod.PUT,
      CorsHttpMethod.DELETE,
    ],
    allowOrigins: ['*'], // for dev
  },
});

// connect lambda
const integration = new HttpLambdaIntegration(
  'TodoIntegration',
  backend.todoApi.resources.lambda
);

// routes
httpApi.addRoutes({
  path: '/todos',
  methods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT],
  integration,
});

httpApi.addRoutes({
  path: '/todos/{id}',
  methods: [HttpMethod.DELETE],
  integration,
});

//  PRINT URL
backend.addOutput({
  custom: {
    apiUrl: httpApi.url,
  },
});
