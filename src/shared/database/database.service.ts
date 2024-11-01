import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PostgresJsDatabase,
  drizzle as drizzlePgJs,
} from 'drizzle-orm/postgres-js';
import { NEST_DATABASE_OPTIONS } from 'src/core/constrants/db.constants';
import { NestDrizzleOptions } from './interfaces/database.interfaces';
import * as postgres from 'postgres';
import { migrate as migratePgJs } from 'drizzle-orm/postgres-js/migrator';

interface IDatabaseService {
  migrate(): Promise<void>;
  getDrizzle(): Promise<PostgresJsDatabase>;
}

@Injectable()
export class DatabaseService implements IDatabaseService {
  private _drizzle: PostgresJsDatabase<Record<string, unknown>>;
  constructor(
    @Inject(NEST_DATABASE_OPTIONS)
    private _NestDrizzleOptions: NestDrizzleOptions,
  ) {}

  private logger = new Logger('DatabaseService');

  async migrate(): Promise<void> {
    const client = postgres(this._NestDrizzleOptions.url, { max: 1 });
    await migratePgJs(
      drizzlePgJs(client),
      this._NestDrizzleOptions.migrationOptions,
    );
  }
  async getDrizzle(): Promise<any> {
    let client: postgres.Sql<Record<string, never>>;

    if (!this._drizzle) {
      client = postgres(this._NestDrizzleOptions.url, {
        ssl: { rejectUnauthorized: false },
        prepare: false,
      });
      try {
        await client`SELECT 1`; // Sending a test query to check connection
        this.logger.log('Database connected successfully');
      } catch (error) {
        this.logger.error('Database connection error', error);
        throw error; // Propagate the error
      }
      this._drizzle = drizzlePgJs(client, this._NestDrizzleOptions.options);
    }
    return this._drizzle;
  }
}
