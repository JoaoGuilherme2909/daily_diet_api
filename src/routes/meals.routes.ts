import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (req, res) => {
    try {
      await req.jwtVerify();
    } catch {
      res.status(403).send('Usuario nao autorizado');
    }
  });

  app.get('/', async (req) => {
    const user = await knex('users')
      .where('email', req.user.email)
      .select('id')
      .first();

    return await knex('meals').where('user_id', user?.id).select('*');
  });

  app.get('/:id', async (req) => {
    const user = await knex('users')
      .where('email', req.user.email)
      .select('id')
      .first();

    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = requestParamsSchema.parse(req.params);

    const meal = knex('meals')
      .where('user_id', user?.id)
      .andWhere('id', id)
      .select('*');

    return meal;
  });

  app.post('/', async (req, res) => {
    const user = await knex('users')
      .where('email', req.user.email)
      .select('id')
      .first();

    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      in_diet: z.boolean(),
    });

    const { description, in_diet, name } = createMealSchema.parse(req.body);

    await knex('meals').insert({
      id: randomUUID(),
      description,
      name,
      in_diet,
      user_id: user?.id,
    });

    return res.status(201).send();
  });

  app.delete('/:id', async (req, res) => {
    const user = await knex('users')
      .where('email', req.user.email)
      .select('id')
      .first();

    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = requestParamsSchema.parse(req.params);

    await knex('meals').where('user_id', user?.id).andWhere('id', id).delete();

    return res.status(204).send();
  });
}
