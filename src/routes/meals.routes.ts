import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getUser } from '../util/getUser';

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', async (req, res) => {
    try {
      await req.jwtVerify();
    } catch {
      res.status(403).send('Usuario nao autorizado');
    }
  });

  app.get('/', async (req) => {
    const getUserSchema = z.object({
      email: z.string().email(),
    });

    const { email } = getUserSchema.parse(req.user);
    return await knex('meals')
      .where('user_id', await getUser(email))
      .select('*');
  });

  app.get('/:id', async (req) => {
    const getUserSchema = z.object({
      email: z.string().email(),
    });

    const { email } = getUserSchema.parse(req.user);

    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = requestParamsSchema.parse(req.params);

    const meal = knex('meals')
      .where('user_id', await getUser(email))
      .andWhere('id', id)
      .select('*');

    return meal;
  });

  app.get('/summary/all', async (req) => {
    const getUserSchema = z.object({
      email: z.string().email(),
    });

    const { email } = getUserSchema.parse(req.user);

    return await knex('meals')
      .where('user_id', await getUser(email))
      .count('*');
  });

  app.get('/summary/diet', async (req) => {
    const getUserSchema = z.object({
      email: z.string().email(),
    });

    const { email } = getUserSchema.parse(req.user);

    return await knex('meals')
      .where('in_diet', true)
      .where('user_id', await getUser(email))
      .count('*');
  });

  app.get('/summary/off-diet', async (req) => {
    const getUserSchema = z.object({
      email: z.string().email(),
    });

    const { email } = getUserSchema.parse(req.user);

    return await knex('meals')
      .where('in_diet', false)
      .where('user_id', await getUser(email))
      .count('*');
  });

  app.get('/summary/streak', async (req) => {
    const getUserSchema = z.object({
      email: z.string().email(),
    });

    const { email } = getUserSchema.parse(req.user);

    return await knex.raw(`
      SELECT
        COUNT(*) AS meal_streak
      FROM (
        SELECT
          user_id,
          ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 
          ROW_NUMBER() OVER (PARTITION BY user_id, in_diet ORDER BY created_at) AS in_diet_group
        FROM
          meals
        WHERE
          in_diet = 1
          and user_id = '${await getUser(email)}'
        ) AS subquery
        GROUP BY
          user_id,
          in_diet_group
        ORDER BY
          user_id,
          in_diet_group;
`);
  });

  app.post('/', async (req, res) => {
    const getUserSchema = z.object({
      email: z.string().email(),
    });

    const { email } = getUserSchema.parse(req.user);

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
      user_id: await getUser(email),
    });

    return res.status(201).send();
  });

  app.delete('/:id', async (req, res) => {
    const getUserSchema = z.object({
      email: z.string().email(),
    });

    const { email } = getUserSchema.parse(req.user);
    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = requestParamsSchema.parse(req.params);

    await knex('meals')
      .where('user_id', await getUser(email))
      .andWhere('id', id)
      .delete();

    return res.status(204).send();
  });

  app.patch('/', async (req, res) => {
    const getUserSchema = z.object({
      email: z.string().email(),
    });

    const { email } = getUserSchema.parse(req.user);

    const updateMealSchema = z.object({
      mealId: z.string(),
      name: z.string().nullish(),
      description: z.string().nullish(),
      date: z.string().date().nullish(),
      inDiet: z.boolean().nullish(),
    });

    const { date, description, inDiet, mealId, name } = updateMealSchema.parse(
      req.body,
    );

    const user = await getUser(email);

    const meal = await knex('meals')
      .where('user_id', user)
      .andWhere('id', mealId)
      .first()
      .select('*');

    await knex('meals')
      .where('user_id', user)
      .andWhere('id', mealId)
      .update({
        created_at: date ?? meal.created_at,
        description: description ?? meal.description,
        in_diet: inDiet ?? meal.in_diet,
        name: name ?? meal.name,
      });

    return res.status(204).send();
  });
}
