import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';

// Link de autenticación para agregar token JWT
const authLink = setContext(async (_: any, { headers }: any) => {
  const session = await getSession();
  let token = null;

  if (session?.user && 'backendToken' in session.user) {
    token = (session.user as any).backendToken;
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const httpLink = new HttpLink({
  uri: '/api/v1/music/graphql',
  credentials: 'same-origin',
});

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
