import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { hash } from 'argon2';

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
    });

    const { email, name, password } = createUserSchema.parse(req.body);
    await knex('users').insert({
      id: randomUUID(),
      email,
      name,
      hash: await hash(password),
    });

    return res.status(201).send();
  });
}
