import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Tạo HTTP app
  const app = await NestFactory.create(AppModule);

  // Enable CORS để fix strict-origin-when-cross-origin
  app.enableCors({
    origin: true, // Cho phép tất cả origins, hoặc chỉ định cụ thể: ['http://localhost:3000', 'http://127.0.0.1:3000']
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
      url: 'mqtt://192.168.0.107:1883',
      username: 'user',
      password: '123456',
    },
  });

  // Start cả HTTP server và microservices
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);

  console.log('🚀 HTTP Server running on port 3000');
  console.log('📡 MQTT Microservice connected to 127.0.0.1:1883');
}

void bootstrap();
