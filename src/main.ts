import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Tạo HTTP app
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true, // Cho phép gửi cookies/credentials
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('IoT Backend API')
    .setDescription('API documentation for IoT Backend system')
    .setVersion('1.0')
    .addTag('sensor', 'Sensor management')
    .addTag('sensor-data', 'Sensor data operations')
    .addTag('actuator', 'Actuator management')
    .addTag('device', 'Device management')
    .addTag('action', 'Action management')
    .addTag('action-history', 'Action history operations')
    .addTag('mqtt', 'MQTT operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Thêm MQTT microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: 'mqtt://172.20.10.4:1883',
      username: 'user',
      password: '123456',
    },
  });

  // Start cả HTTP server và microservices
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);

  console.log('🚀 HTTP Server running on port 3000');
}

void bootstrap();
