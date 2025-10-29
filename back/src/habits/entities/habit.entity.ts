import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { HabitLog } from "src/habit-logs/habit-log.entity";

export enum HabitFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    CUSTOM = 'custom'
}

@Entity('habits')
export class Habit {
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
        type: 'enum',
        enum: HabitFrequency,
        default: HabitFrequency.DAILY
    })
    frequency: HabitFrequency;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true
    })
    icon: string; // Emoji o nombre del icono

    @Column({
        type: 'varchar',
        length: 20,
        default: '#3b82f6'
    })
    color: string;

    @Column({
        type: 'int',
        default: 0
    })
    currentStreak: number;

    @Column({
        type: 'int',
        default: 0
    })
    longestStreak: number;

    @Column({
        type: 'int',
        default: 0
    })
    totalCompletions: number;

    @Column({
        type: 'boolean',
        default: true
    })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relaciones
    @ManyToOne(() => User, (user) => user.habits, { onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'uuid' })
    userId: string;

    @OneToMany(() => HabitLog, (log) => log.habit)
    logs: HabitLog[];
}