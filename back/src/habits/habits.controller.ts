import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/get-user.decorator';

@ApiTags('Habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
    constructor(private readonly habitsService: HabitsService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo hábito' })
    @ApiResponse({ status: 201, description: 'Hábito creado exitosamente' })
    async create(
        @GetUser('userId') userId: string,
        @Body() createHabitDto: CreateHabitDto,
    ) {
        return await this.habitsService.create(userId, createHabitDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los hábitos del usuario' })
    @ApiResponse({ status: 200, description: 'Lista de hábitos' })
    async findAll(@GetUser('userId') userId: string) {
        return await this.habitsService.findAllByUser(userId);
    }

    @Get('summary')
    @ApiOperation({ summary: 'Obtener resumen del día' })
    @ApiResponse({ status: 200, description: 'Resumen de hábitos del día' })
    async getTodaySummary(@GetUser('userId') userId: string) {
        return await this.habitsService.getTodaySummary(userId);
    }

    // ✅ NUEVO ENDPOINT
    @Get('monthly-stats')
    @ApiOperation({ summary: 'Obtener estadísticas mensuales de completaciones' })
    @ApiResponse({ status: 200, description: 'Datos de completaciones por día del mes actual' })
    async getMonthlyStats(
        @GetUser('userId') userId: string,
        @Query('year') year?: number,
        @Query('month') month?: number
    ) {
        return await this.habitsService.getMonthlyStats(userId, year, month);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un hábito por ID' })
    @ApiResponse({ status: 200, description: 'Hábito encontrado' })
    @ApiResponse({ status: 404, description: 'Hábito no encontrado' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser('userId') userId: string,
    ) {
        return await this.habitsService.findOne(id, userId);
    }

    @Get(':id/progress')
    @ApiOperation({ summary: 'Obtener progreso del hábito (últimos 30 días)' })
    @ApiResponse({ status: 200, description: 'Progreso del hábito' })
    async getProgress(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser('userId') userId: string,
    ) {
        return await this.habitsService.getHabitProgress(id, userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un hábito' })
    @ApiResponse({ status: 200, description: 'Hábito actualizado' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser('userId') userId: string,
        @Body() updateHabitDto: UpdateHabitDto,
    ) {
        return await this.habitsService.update(id, userId, updateHabitDto);
    }

    @Patch(':id/toggle')
    @ApiOperation({ summary: 'Activar/desactivar un hábito' })
    @ApiResponse({ status: 200, description: 'Estado del hábito cambiado' })
    async toggleActive(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser('userId') userId: string,
    ) {
        return await this.habitsService.toggleActive(id, userId);
    }

    @Post(':id/complete')
    @ApiOperation({ summary: 'Marcar hábito como completado hoy' })
    @ApiResponse({ status: 200, description: 'Hábito completado' })
    @ApiResponse({ status: 403, description: 'Ya fue completado hoy' })
    async complete(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser('userId') userId: string,
        @Body() completeHabitDto: CompleteHabitDto,
    ) {
        return await this.habitsService.completeHabit(id, userId, completeHabitDto);
    }

    @Delete(':id/complete')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Desmarcar hábito de hoy' })
    @ApiResponse({ status: 204, description: 'Hábito desmarcado' })
    async uncomplete(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser('userId') userId: string,
    ) {
        await this.habitsService.uncompleteHabit(id, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un hábito' })
    @ApiResponse({ status: 204, description: 'Hábito eliminado' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser('userId') userId: string,
    ) {
        await this.habitsService.remove(id, userId);
    }
}