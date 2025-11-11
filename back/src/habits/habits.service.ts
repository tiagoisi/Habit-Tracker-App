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
import { HabitFrequency } from './entities/habit.entity';

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
   // Modificamos findAllByUser
async findAllByUser(userId: string): Promise<any[]> {
    const habits = await this.habitRepository.find({
        // ... (código existente)
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habitsWithStreaksAndStatus = await Promise.all(
        habits.map(async (habit) => {
            
            // 1. Actualiza las estadísticas del hábito
            const updatedStats = await this.updateHabitStats(habit); 

            // 2. ✅ Calcular la tasa mensual específica del Hábito
            const monthlyHabitRate = await this.calculateMonthlyHabitRate(habit);
            
            // 3. Buscar si el hábito fue completado hoy
            const logToday = await this.habitLogRepository.findOne({
                where: {
                    habitId: habit.id,
                    date: today,
                    completed: true,
                },
            });

            return {
                ...habit, 
                currentStreak: updatedStats.currentStreak,
                longestStreak: updatedStats.longestStreak,
                totalCompletions: updatedStats.totalCompletions,
                completedToday: !!logToday,
                // ✅ NUEVA PROPIEDAD
                monthlyHabitRate: monthlyHabitRate, 
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
    private async updateHabitStats(habit: Habit): Promise<{ currentStreak: number; longestStreak: number; totalCompletions: number }> {
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

        return {
            currentStreak,
            longestStreak,
            totalCompletions,
        };
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
            monthlyCompletionRate: 0, // ✅ Nueva métrica
        };
    }

    const habitIds = habits.map(h => h.id);

    // Completados HOY
    const completedToday = await this.habitLogRepository.count({
        where: {
            date: today,
            completed: true,
            habitId: In(habitIds),
        },
    });

    // ✅ NUEVO: Calcular tasa de completación del mes hasta hoy
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Días transcurridos del mes (incluyendo hoy)
    const daysElapsed = today.getDate();

    // Total de completaciones posibles: hábitos × días transcurridos
    const possibleCompletions = habits.length * daysElapsed;

    // Total de completaciones reales del mes
    const monthlyCompletions = await this.habitLogRepository.count({
        where: {
            date: Between(firstDayOfMonth, today),
            completed: true,
            habitId: In(habitIds),
        },
    });

    const monthlyCompletionRate = possibleCompletions > 0 
        ? Math.round((monthlyCompletions / possibleCompletions) * 100) 
        : 0;

    return {
        totalHabits: habits.length,
        completedToday,
        pendingToday: habits.length - completedToday,
        completionRate: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0, // Tasa del día
        monthlyCompletionRate, // ✅ Tasa del mes
        daysElapsed,
        monthlyCompletions,
        possibleCompletions,
    };
}

     // ✅ NUEVO MÉTODO
    async getMonthlyStats(userId: string, year?: number, month?: number): Promise<any> {
    // Usar fecha actual si no se especifica
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month !== undefined ? month : now.getMonth(); // 0-11

    // Primer día del mes
    const startDate = new Date(targetYear, targetMonth, 1);
    startDate.setHours(0, 0, 0, 0);

    // Último día del mes
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    // Obtener todos los hábitos del usuario
    const habits = await this.habitRepository.find({
        where: { userId, isActive: true },
        select: ['id']
    });

    if (habits.length === 0) {
        return {
            year: targetYear,
            month: targetMonth + 1,
            data: []
        };
    }

    const habitIds = habits.map(h => h.id);

    // Obtener todos los logs del mes
    const logs = await this.habitLogRepository
        .createQueryBuilder('log')
        .select('DATE(log.date) as date')
        .addSelect('COUNT(DISTINCT log.habitId) as completed')
        .where('log.habitId IN (:...habitIds)', { habitIds })
        .andWhere('log.date >= :startDate', { startDate })
        .andWhere('log.date <= :endDate', { endDate })
        .andWhere('log.completed = :completed', { completed: true })
        .groupBy('DATE(log.date)')
        .orderBy('date', 'ASC')
        .getRawMany();

    // Crear un mapa de fechas con completaciones
    const completionsMap = new Map();
    logs.forEach(log => {
        const date = new Date(log.date);
        const day = date.getDate();
        completionsMap.set(day, parseInt(log.completed));
    });

    // ✅ Determinar hasta qué día mostrar datos
    const today = new Date();
    const isCurrentMonth = targetYear === today.getFullYear() && targetMonth === today.getMonth();
    const currentDay = isCurrentMonth ? today.getDate() : endDate.getDate();

    // Generar array con todos los días del mes
    const daysInMonth = endDate.getDate();
    interface DayData {
        day: number;
        completed: number | null;
        label: string;
    }
    const data: DayData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
        // ✅ Solo incluir "completed" si es un día pasado o actual
        data.push({
            day,
            completed: day <= currentDay ? (completionsMap.get(day) || 0) : null, // null para días futuros
            label: `Día ${day}`
        });
    }

    return {
        year: targetYear,
        month: targetMonth + 1,
        totalHabits: habits.length,
        currentDay: isCurrentMonth ? currentDay : null, // Info adicional
        data
    };
    }
    
    private async calculateMonthlyHabitRate(habit: Habit): Promise<number> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Días transcurridos del mes (incluyendo hoy)
    const daysElapsed = today.getDate(); 

    // Solo calcular para hábitos diarios por simplicidad en la tarjeta
    if (habit.frequency !== HabitFrequency.DAILY) {
        return 0; 
    }

    // Completaciones reales del hábito en el mes
    const monthlyCompletions = await this.habitLogRepository.count({
        where: {
            habitId: habit.id,
            date: Between(firstDayOfMonth, today),
            completed: true,
        },
    });

    // Completaciones posibles (hábitos diarios): días transcurridos
    const possibleCompletions = daysElapsed;

    const monthlyRate = possibleCompletions > 0 
        ? Math.round((monthlyCompletions / possibleCompletions) * 100) 
        : 0;
        
    return monthlyRate; // Devuelve el porcentaje de completación mensual del hábito (0-100)
}

}