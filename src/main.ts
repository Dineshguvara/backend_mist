import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // Automatically strip properties not defined in DTO
      forbidNonWhitelisted: true, // Throw an error if extra properties are present
    }),
  );

  // Enable CORS with default settings
  app.enableCors({
    origin: '*', // Temporarily allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use((req: { method: any; url: any }, res: any, next: () => void) => {
    console.log('Incoming Request:', req.method, req.url);
    next();
  });

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Role API')
    .setDescription('API for managing roles')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  // Listen on all network interfaces (0.0.0.0) and specific port
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap();
