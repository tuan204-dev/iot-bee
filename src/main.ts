import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

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
