import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
  });

  app.setGlobalPrefix('api');

  await app.listen(3599, () => {
    console.log(
      '\x1b[33m%s\x1b[0m',
      `=> 🚀 ApiGerenciaSolicitacaoTcc RUNNING ON PORT: 3599`,
    );
  });
}
bootstrap();
