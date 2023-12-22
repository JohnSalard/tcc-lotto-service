import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const port = process.env.PORT ? process.env.PORT : 3003;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder().setTitle('Lotto Service').setDescription('The lotto API for issued lottery').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
  console.log(`Server listening on port: '${port}'`);
}

(async () => {
  await bootstrap();
})();
