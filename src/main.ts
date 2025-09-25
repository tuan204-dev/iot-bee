import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Tạo HTTP app
  const app = await NestFactory.create(AppModule);

  // Thêm MQTT microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: 'mqtt://127.0.0.1:1883',
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
