import { FastifyInstance } from 'fastify';
import { knex } from '../database';

export async function userRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const tables = knex('sqliteschemas').select('*');
    return tables;
  });
}
