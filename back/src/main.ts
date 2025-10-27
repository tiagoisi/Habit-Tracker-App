import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    });

    // Validación global
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Remueve campos que no están en el DTO
            forbidNonWhitelisted: true, // Lanza error si hay campos extras
            transform: true, // Transforma los tipos automáticamente
        }),
    );

    // Configuración de Swagger
    const config = new DocumentBuilder()
        .setTitle('Habit Tracker App')
        .setDescription('API para gestión de hábitos con gamificación')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Auth', 'Endpoints de autenticación')
        .addTag('Users', 'Endpoints de usuarios')
        .addTag('Habits', 'Endpoints de hábitos')
        .addTag('Achievements', 'Endpoints de logros')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    console.log(`🛸 Servidor corriendo en http://localhost:${port}`);
    console.log(`📚 Documentación disponible en http://localhost:${port}/docs`);
}

bootstrap();