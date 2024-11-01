import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { DatabaseService } from './database.service';
import {
  connectionFactory,
  createNestDrizzleProviders,
} from './database.provider';
import {
  NestDrizzleAsyncOptions,
  NestDrizzleOptions,
  NestDrizzleOptionsFactory,
} from './interfaces/database.interfaces';
import { NEST_DATABASE_OPTIONS } from '../../core/constrants/db.constants';

@Global()
@Module({
  providers: [DatabaseService, connectionFactory],
  exports: [DatabaseService, connectionFactory],
})
export class NestDrizzleModule {
  public static register(options: NestDrizzleOptions): DynamicModule {
    return {
      module: NestDrizzleModule,
      providers: createNestDrizzleProviders(options),
    };
  }

  public static registerAsync(options: NestDrizzleAsyncOptions): DynamicModule {
    return {
      module: NestDrizzleModule,
      providers: [...this.createProviders(options)],
    };
  }

  public static forRoot(options: NestDrizzleOptions): DynamicModule {
    const providers = createNestDrizzleProviders(options);
    return {
      module: NestDrizzleModule,
      providers: providers,
      exports: providers,
    };
  }

  public static forRootAsync(options: NestDrizzleAsyncOptions): DynamicModule {
    return {
      module: NestDrizzleModule,
      providers: [...this.createProviders(options)],
      exports: [...this.createProviders(options)],
    };
  }

  private static createProviders(options: NestDrizzleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createOptionsProvider(options)];
    }

    return [
      this.createOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createOptionsProvider(
    options: NestDrizzleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: NEST_DATABASE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: NEST_DATABASE_OPTIONS,
      useFactory: async (optionsFactory: NestDrizzleOptionsFactory) =>
        await optionsFactory.createNestDrizzleOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
