import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DatabaseService } from './database.service';
import { NestDrizzleOptions } from './interfaces/database.interfaces';
import {
  DRIZZLE_ORM,
  NEST_DATABASE_OPTIONS,
} from 'src/core/constrants/db.constants';

export const connectionFactory = {
  provide: DRIZZLE_ORM,
  useFactory: async (nestDrizzleService: {
    getDrizzle: () => Promise<PostgresJsDatabase>;
  }) => {
    return nestDrizzleService.getDrizzle();
  },
  inject: [DatabaseService],
};

export function createNestDrizzleProviders(options: NestDrizzleOptions) {
  return [
    {
      provide: NEST_DATABASE_OPTIONS,
      useValue: options,
    },
  ];
}
