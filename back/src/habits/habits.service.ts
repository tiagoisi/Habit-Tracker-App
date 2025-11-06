import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Habit } from './entities/habit.entity';
import { HabitLog } from '../habit-logs/habit-log.entity';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { UsersService } from 'src/user/user.service';
import { AchievementsService } from '../achievements/achievements.service';

@Injectable()
export class HabitsService {
    constructor(
        @InjectRepository(Habit)
        private readonly habitRepository: Repository<Habit>,
        @InjectRepository(HabitLog)
        private readonly habitLogRepository: Repository<HabitLog>,
        private readonly usersService: UsersService,
        private readonly achievementsService: AchievementsService,
    ) {}

    async create(userId: string, createHabitDto: CreateHabitDto): Promise<Habit> {
        const habit = this.habitRepository.create({
            ...createHabitDto,
            userId,
        });

        return await this.habitRepository.save(habit);
    }

    // Traigo habitos del usuario y calculo racha
    async findAllByUser(userId: string): Promise<any[]> {
        const habits = await this.habitRepository.find({
            where: { userId, isActive: true },
            order: { createdAt: 'DESC' },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const habitsWithStreaksAndStatus = await Promise.all(
            habits.map(async (habit) => {
                
                await this.updateHabitStats(habit);

                const updatedHabit = await this.habitRepository.findOne({ where: { id: habit.id } });
                
                if (!updatedHabit) return habit; // Fallback si no se encuentra

                const logToday = await this.habitLogRepository.findOne({
                    where: {
                        habitId: updatedHabit.id,
                        date: today,
                        completed: true,
                    },
                });

                return {
                    ...updatedHabit, 
                    completedToday: !!logToday,
                };
            })
        );

        return habitsWithStreaksAndStatus;
    }

    async findOne(id: string, userId: string): Promise<Habit> {
        const habit = await this.habitRepository.findOne({
            where: { id },
            relations: ['logs'],
        });

        if (!habit) {
            throw new NotFoundException(`Hábito con ID ${id} no encontrado`);
        }

        if (habit.userId !== userId) {
            throw new ForbiddenException('No tenés permiso para acceder a este hábito');
        }

        return habit;
    }

    async update(id: string, userId: string, updateHabitDto: UpdateHabitDto): Promise<Habit> {
        const habit = await this.findOne(id, userId);
        Object.assign(habit, updateHabitDto);
        return await this.habitRepository.save(habit);
    }

    async remove(id: string, userId: string): Promise<void> {
        const habit = await this.findOne(id, userId);
        await this.habitRepository.remove(habit);
    }

    async toggleActive(id: string, userId: string): Promise<Habit> {
        const habit = await this.findOne(id, userId);
        habit.isActive = !habit.isActive;
        return await this.habitRepository.save(habit);
    }

    async completeHabit(id: string, userId: string, completeHabitDto?: CompleteHabitDto): Promise<any> {
        const habit = await this.findOne(id, userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Verificar si ya fue completado hoy
        const existingLog = await this.habitLogRepository.findOne({
            where: {
                habitId: id,
                date: today,
            },
        });

        if (existingLog) {
            throw new ForbiddenException('Este hábito ya fue completado hoy');
        }

        // Crear log
        const log = this.habitLogRepository.create({
            habitId: id,
            date: today,
            completed: true,
            notes: completeHabitDto?.notes,
        });

        await this.habitLogRepository.save(log);

        await this.updateHabitStats(habit);

        await this.usersService.addPoints(userId, { points: 10 });

        // Habito con las estadisticas actualizadas de la DB
        const updatedHabit = await this.habitRepository.findOne({ where: { id } });
        if (!updatedHabit) throw new NotFoundException(`Habito con id ${id} no encontrado`);

        // Verificar y desbloquear logros
        const newAchievements = await this.achievementsService.checkAfterHabitCompletion(
            userId,
            {
                currentStreak: updatedHabit.currentStreak,
                longestStreak: updatedHabit.longestStreak,
                totalCompletions: updatedHabit.totalCompletions,
            }
        );

        return {
            log,
            habit: updatedHabit,
            newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
        };
    }

    async uncompleteHabit(id: string, userId: string): Promise<void> {
        const habit = await this.findOne(id, userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const log = await this.habitLogRepository.findOne({
            where: {
                habitId: id,
                date: today,
            },
        });

        if (!log) {
            throw new NotFoundException('No hay registro de hoy para eliminar');
        }

        await this.habitLogRepository.remove(log);

        // Actualizar estadísticas
        await this.updateHabitStats(habit);

        // Restar puntos al usuario
        await this.usersService.addPoints(userId, { points: -10 });
    }

    // Calculo streak y totalCompletions.
    private async updateHabitStats(habit: Habit): Promise<void> {
        const logs = await this.habitLogRepository.find({
            where: { habitId: habit.id, completed: true },
            order: { date: 'DESC' },
        });

        const totalCompletions = logs.length;
        let currentStreak = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let checkDate = new Date(today.getTime()); 

        if (logs.length === 0) {
            currentStreak = 0;
        } else {
            const lastLogDate = new Date(logs[0].date);
            lastLogDate.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(today.getTime());
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            
            let startIndex = 0;

            if (lastLogDate.getTime() === today.getTime()) {
                currentStreak = 1;
                checkDate = yesterday; 
                startIndex = 1;
            } 

            else if (lastLogDate.getTime() === yesterday.getTime()) {
                currentStreak = 1;
                checkDate.setDate(checkDate.getDate() - 2);
                startIndex = 1;
            } 

            else {
                currentStreak = 0;
            }

            // Continuar la racha hacia el pasado
            for (let i = startIndex; i < logs.length; i++) {
                const log = logs[i];
                const logDate = new Date(log.date);
                logDate.setHours(0, 0, 0, 0);

                if (logDate.getTime() === checkDate.getTime()) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1); 
                } 
                else if (logDate.getTime() < checkDate.getTime()) {
                    break; 
                }
            }
        }
        
        const longestStreak = Math.max(habit.longestStreak, currentStreak); 

        // Actualizar los campos en la DB
        await this.habitRepository.update(habit.id, {
            totalCompletions,
            currentStreak,
            longestStreak,
        });
    }

    async getHabitProgress(id: string, userId: string): Promise<any> {
        const habit = await this.findOne(id, userId);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await this.habitLogRepository.find({
            where: {
                habitId: id,
                date: Between(thirtyDaysAgo, new Date()),
            },
            order: { date: 'ASC' },
        });

        return {
            habit: {
                id: habit.id,
                title: habit.title,
                currentStreak: habit.currentStreak,
                longestStreak: habit.longestStreak,
                totalCompletions: habit.totalCompletions,
            },
            logs: logs.map(log => ({
                date: log.date,
                completed: log.completed,
                notes: log.notes,
            })),
        };
    }

    async getTodaySummary(userId: string): Promise<any> {
        const habits = await this.findAllByUser(userId); // Racha actualizada
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (habits.length === 0) {
            return {
                totalHabits: 0,
                completedToday: 0,
                pendingToday: 0,
                completionRate: 0,
            };
        }

        const habitIds = habits.map(h => h.id);

        const completedToday = await this.habitLogRepository.count({
            where: {
                date: today,
                completed: true,
                habitId: In(habitIds),
            },
        });

        return {
            totalHabits: habits.length,
            completedToday,
            pendingToday: habits.length - completedToday,
            completionRate: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0,
        };
    }
}