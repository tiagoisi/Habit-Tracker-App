import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { AchievementType } from './entities/achievement.entity';
import { UsersService } from 'src/user/user.service';

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
        // Obtener total de completaciones del usuario
        const userStats = await this.usersService.getUserStats(userId);

        return await this.checkAndUnlockAchievements(userId, {
            maxStreak: habitStats.longestStreak,
            totalCompletions: userStats.totalHabits, // Total de hábitos del usuario
        });
    }

    // Obtener progreso de logros
    async getProgress(userId: string): Promise<any> {
        await this.initializeAchievements(userId);

        const achievements = await this.findAllByUser(userId);
        const unlocked = achievements.filter(a => a.isUnlocked).length;
        const total = achievements.length;

        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100),
            achievements: achievements.map(a => ({
                id: a.id,
                title: a.title,
                description: a.description,
                icon: a.icon,
                type: a.type,
                requiredCount: a.requiredCount,
                pointsReward: a.pointsReward,
                isUnlocked: a.isUnlocked,
                unlockedAt: a.unlockedAt,
            })),
        };
    }
}