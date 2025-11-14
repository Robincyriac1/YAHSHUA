import dotenv from 'dotenv';
import { Knex } from 'knex';

dotenv.config();

export interface DatabaseConfig {
  client: string;
  connection: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  pool: {
    min: number;
    max: number;
  };
  migrations: {
    directory: string;
    tableName: string;
  };
  seeds: {
    directory: string;
  };
}

export const databaseConfig: DatabaseConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'yahshua_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yahshua'
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10')
  },
  migrations: {
    directory: './database/migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './database/seeds'
  }
};

// Knex configuration for different environments
const knexConfig: { [key: string]: Knex.Config } = {
  development: databaseConfig,
  
  test: {
    ...databaseConfig,
    connection: {
      ...databaseConfig.connection,
      database: process.env.DB_NAME_TEST || 'yahshua_test'
    }
  },
  
  production: {
    ...databaseConfig,
    connection: process.env.DATABASE_URL || {
      ...databaseConfig.connection
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      max: parseInt(process.env.DB_POOL_MAX || '50')
    }
  }
};

export default knexConfig;
