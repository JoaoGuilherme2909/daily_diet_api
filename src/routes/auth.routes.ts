import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { verify } from 'argon2';

export async function authRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const loginUserSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = loginUserSchema.parse(req.body);

    const user = await knex('users')
      .where('email', email)
      .select('email', 'hash')
      .first();

    if (user) {
      const isAuthorized = await verify(user?.hash, password);

      if (isAuthorized) {
        const token = app.jwt.sign({ email }, { expiresIn: '1h' });

        return { token };
      }
    }

    return res.status(401).send('Usuario inexistente');
  });
}
