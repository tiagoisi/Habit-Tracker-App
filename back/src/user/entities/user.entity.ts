import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Habit } from "src/habits/entities/habit.entity";
import { Achievement } from "src/achievements/entities/achievement.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false,
        unique: true
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 60,
        nullable: false,
        select: false //! No exponer el password en queries por defecto
    })
    password: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false
    })
    name: string;

    @Column({ 
        type: 'int', 
        default: 0 
    })
    points: number;

    @Column({ 
        type: 'int', 
        default: 1 
    })
    level: number;

    @Column({
        type: 'varchar',
        length: 200,
        nullable: true
    })
    avatar?: string;

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
    @OneToMany(() => Habit, (habit) => habit.user)
    habits: Habit[];

    @OneToMany(() => Achievement, (achievement) => achievement.user)
    achievements: Achievement[];
}