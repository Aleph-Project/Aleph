import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: '/api/v1/music/graphql', // Cambia si tu endpoint GraphQL es diferente
    credentials: 'same-origin',
  }),
  cache: new InMemoryCache(),
});

export default client;
