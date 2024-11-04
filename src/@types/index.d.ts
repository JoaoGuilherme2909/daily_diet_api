import { Knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string;
      name: string;
      email: string;
      hash: string;
      created_at: string;
    };
    meals: {
      id: string;
      user_id: string;
      name: string;
      description: string;
      email: string;
      hash: string;
      created_at: string;
    };
  }
}
