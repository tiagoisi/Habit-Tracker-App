import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/get-user.decorator';

@ApiTags('Achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('achievements')
export class AchievementsController {
    constructor(private readonly achievementsService: AchievementsService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todos los logros del usuario' })
    @ApiResponse({ status: 200, description: 'Lista de logros' })
    async findAll(@GetUser('userId') userId: string) {
        return await this.achievementsService.findAllByUser(userId);
    }

    @Get('progress')
    @ApiOperation({ summary: 'Obtener progreso de logros' })
    @ApiResponse({ status: 200, description: 'Progreso de logros con estadísticas' })
    async getProgress(@GetUser('userId') userId: string) {
        return await this.achievementsService.getProgress(userId);
    }
}