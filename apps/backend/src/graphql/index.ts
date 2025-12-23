import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import type { Express } from 'express';

const typeDefs = `
  type Query {
    health: String!
  }

  type Mutation {
    _placeholder: String
  }
`;

const resolvers = {
  Query: {
    health: () => 'GraphQL server is running!',
  },
};

const schema = createSchema({
  typeDefs,
  resolvers,
});

export function setupGraphQL(app: Express) {
  const yoga = createYoga({
    schema,
    graphqlEndpoint: '/graphql',
    landingPage: true,
  });

  app.use('/graphql', yoga);
  console.log('✅ GraphQL server configured');
}
