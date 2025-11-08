import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { AchievementType } from './entities/achievement.entity';
import { UsersService } from 'src/user/user.service';
import { Habit } from 'src/habits/entities/habit.entity';

// Definición de logros predeterminados
const DEFAULT_ACHIEVEMENTS = [
    {
        title: 'Primer Paso',
        description: 'Completaste tu primer hábito',
        icon: '🎯',
        type: AchievementType.FIRST_HABIT,
        requiredCount: 1,
        pointsReward: 50,
    },
    {
        title: 'Racha de Fuego',
        description: 'Completaste 7 días seguidos',
        icon: '🔥',
        type: AchievementType.STREAK,
        requiredCount: 7,
        pointsReward: 100,
    },
    {
        title: 'Imparable',
        description: 'Completaste 30 días seguidos',
        icon: '⚡',
        type: AchievementType.STREAK,
        requiredCount: 30,
        pointsReward: 300,
    },
    {
        title: 'Leyenda',
        description: 'Completaste 100 días seguidos',
        icon: '👑',
        type: AchievementType.STREAK,
        requiredCount: 100,
        pointsReward: 1000,
    },
    {
        title: 'Motivado',
        description: 'Completaste 10 hábitos en total',
        icon: '💪',
        type: AchievementType.TOTAL_HABITS,
        requiredCount: 10,
        pointsReward: 100,
    },
    {
        title: 'Máquina',
        description: 'Completaste 50 hábitos en total',
        icon: '🚀',
        type: AchievementType.TOTAL_HABITS,
        requiredCount: 50,
        pointsReward: 250,
    },
    {
        title: 'Campeón',
        description: 'Completaste 100 hábitos en total',
        icon: '🏆',
        type: AchievementType.TOTAL_HABITS,
        requiredCount: 100,
        pointsReward: 500,
    },
    {
        title: 'Imbatible',
        description: 'Completaste 500 hábitos en total',
        icon: '🎖️',
        type: AchievementType.TOTAL_HABITS,
        requiredCount: 500,
        pointsReward: 2000,
    },
];

@Injectable()
export class AchievementsService {
    constructor(
        @InjectRepository(Achievement)
        private readonly achievementRepository: Repository<Achievement>,
        @InjectRepository(Habit)
        private readonly habitRepository: Repository<Habit>,
        private readonly usersService: UsersService,
    ) {}

    // Inicializar logros para un nuevo usuario
    async initializeAchievements(userId: string): Promise<void> {
        const existingAchievements = await this.achievementRepository.find({
            where: { userId },
        });

        if (existingAchievements.length === 0) {
            const achievements = DEFAULT_ACHIEVEMENTS.map(achievement => 
                this.achievementRepository.create({
                    ...achievement,
                    userId,
                    isUnlocked: false,
                })
            );
            await this.achievementRepository.save(achievements);
        }
    }

    // Obtener todos los logros del usuario
    async findAllByUser(userId: string): Promise<Achievement[]> {
        // Asegurar que el usuario tenga logros inicializados
        await this.initializeAchievements(userId);
        
        return await this.achievementRepository.find({
            where: { userId },
            order: { isUnlocked: 'DESC', requiredCount: 'ASC' },
        });
    }

    // Verificar y desbloquear logros basados en estadísticas
    async checkAndUnlockAchievements(userId: string, stats: {
        maxStreak?: number;
        totalCompletions?: number;
    }): Promise<Achievement[]> {
        const unlockedAchievements: Achievement[] = [];

        // Obtener logros del usuario que no están desbloqueados
        const achievements = await this.achievementRepository.find({
            where: { userId, isUnlocked: false },
        });

        for (const achievement of achievements) {
            let shouldUnlock = false;

            switch (achievement.type) {
                case AchievementType.STREAK:
                    if (stats.maxStreak && stats.maxStreak >= achievement.requiredCount) {
                        shouldUnlock = true;
                    }
                    break;

                case AchievementType.TOTAL_HABITS:
                case AchievementType.FIRST_HABIT:
                    if (stats.totalCompletions && stats.totalCompletions >= achievement.requiredCount) {
                        shouldUnlock = true;
                    }
                    break;
            }

            if (shouldUnlock) {
                achievement.isUnlocked = true;
                achievement.unlockedAt = new Date();
                await this.achievementRepository.save(achievement);

                // Otorgar puntos al usuario
                await this.usersService.addPoints(userId, { 
                    points: achievement.pointsReward 
                });

                unlockedAchievements.push(achievement);
            }
        }

        return unlockedAchievements;
    }

    // Verificar logros después de completar un hábito
    async checkAfterHabitCompletion(userId: string, habitStats: {
        currentStreak: number;
        longestStreak: number;
        totalCompletions: number;
    }): Promise<Achievement[]> {
        // ✅ CORRECCIÓN: Obtener el total de completaciones de TODOS los hábitos del usuario
        const userHabits = await this.habitRepository.find({
            where: { userId },
            select: ['totalCompletions', 'longestStreak']
        });

        // Calcular totales
        const totalUserCompletions = userHabits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
        const maxUserStreak = Math.max(...userHabits.map(h => h.longestStreak), 0);

        return await this.checkAndUnlockAchievements(userId, {
            maxStreak: maxUserStreak,
            totalCompletions: totalUserCompletions,
        });
    }

    // Obtener progreso de logros
    // ✅ MODIFICAR: Obtener progreso de logros CON estadísticas del usuario
    async getProgress(userId: string): Promise<any> {
        await this.initializeAchievements(userId);
        
        const achievements = await this.findAllByUser(userId);
        const unlocked = achievements.filter(a => a.isUnlocked).length;
        const total = achievements.length;

        // ✅ Obtener estadísticas reales del usuario
        const userHabits = await this.habitRepository.find({
            where: { userId },
            select: ['totalCompletions', 'longestStreak', 'currentStreak']
        });

        const totalUserCompletions = userHabits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
        const maxUserStreak = Math.max(...userHabits.map(h => h.longestStreak), 0);
        const currentStreak = Math.max(...userHabits.map(h => h.currentStreak), 0);

        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100),
            // ✅ Agregar estadísticas del usuario
            userStats: {
                totalCompletions: totalUserCompletions,
                maxStreak: maxUserStreak,
                currentStreak: currentStreak,
            },
            achievements: achievements.map(a => {
                // ✅ Calcular progreso actual para cada logro
                let currentProgress = 0;
                
                if (!a.isUnlocked) {
                    switch (a.type) {
                        case AchievementType.STREAK:
                            currentProgress = maxUserStreak;
                            break;
                        case AchievementType.TOTAL_HABITS:
                        case AchievementType.FIRST_HABIT:
                            currentProgress = totalUserCompletions;
                            break;
                    }
                }

                return {
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    icon: a.icon,
                    type: a.type,
                    requiredCount: a.requiredCount,
                    pointsReward: a.pointsReward,
                    isUnlocked: a.isUnlocked,
                    unlockedAt: a.unlockedAt,
                    currentProgress: currentProgress, // ✅ Progreso actual
                    progressPercentage: a.requiredCount > 0 
                        ? Math.min(Math.round((currentProgress / a.requiredCount) * 100), 100)
                        : 0,
                };
            }),
        };
    }
}