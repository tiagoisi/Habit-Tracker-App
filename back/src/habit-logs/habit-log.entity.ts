import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Habit } from "src/habits/entities/habit.entity";

@Entity('habit_logs')
export class HabitLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'date',
        nullable: false
    })
    date: Date;

    @Column({
        type: 'boolean',
        default: true
    })
    completed: boolean;

    @Column({
        type: 'text',
        nullable: true
    })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    // Relaciones
    @ManyToOne(() => Habit, (habit) => habit.logs, { onDelete: 'CASCADE' })
    habit: Habit;

    @Column({ type: 'uuid' })
    habitId: string;
}