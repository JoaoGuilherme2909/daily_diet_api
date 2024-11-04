import { fastify } from 'fastify';
import { userRoutes } from './routes/user.routes';
import fastifyJwt from '@fastify/jwt';
import { env } from './env';
import { authRoutes } from './routes/auth.routes';
import { mealsRoutes } from './routes/meals.routes';

const app = fastify();

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

app.register(userRoutes, { prefix: 'users' });

app.register(authRoutes, { prefix: 'auth' });

app.register(mealsRoutes, { prefix: 'meals' });

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server Running');
});
