import { fastify } from 'fastify';
import { userRoutes } from './routes/user.routes';

const app = fastify();

app.register(userRoutes);

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server Running');
});
