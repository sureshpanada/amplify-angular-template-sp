import { defineData, a } from '@aws-amplify/backend';

export const data = defineData({
  schema: a.schema({
    Todo: a
      .model({
        id: a.string().required(),
        content: a.string(),
        isDone: a.boolean(),
        owner: a.string(),
      })
      .authorization((allow) => [
        allow.owner(), // 🔥 each user sees only their data
      ]),
  }),
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
