import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user/entities/user.entity";

export enum AchievementType {
    STREAK = 'streak',             // Por días seguidos
    TOTAL_HABITS = 'total_habits', // Por hábitos completados
    FIRST_HABIT = 'first_habit',   // Primer hábito
    CONSISTENCY = 'consistency',   // Por consistencia
    MILESTONE = 'milestone'        // Hitos especiales
}

@Entity('achievements')
export class Achievement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    title: string;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true
    })
    icon: string; // Emoji del logro

    @Column({
        type: 'enum',
        enum: AchievementType,
        default: AchievementType.MILESTONE
    })
    type: AchievementType;

    @Column({
        type: 'int',
        default: 0
    })
    requiredCount: number; // Cantidad requerida para desbloquear

    @Column({
        type: 'int',
        default: 50
    })
    pointsReward: number; // Puntos que otorga

    @Column({
        type: 'boolean',
        default: false
    })
    isUnlocked: boolean;

    @CreateDateColumn()
    unlockedAt: Date;

    // Relaciones
    @ManyToOne(() => User, (user) => user.achievements, { onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'uuid' })
    userId: string;
}