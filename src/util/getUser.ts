import { knex } from '../database';

export async function getUser(email: string) {
  const user = await knex('users').where('email', email).select('id').first();
  return user?.id;
}
