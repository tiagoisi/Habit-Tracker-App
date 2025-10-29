import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { Habit } from './entities/habit.entity';
import { HabitLog } from 'src/habit-logs/habit-log.entity';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Habit, HabitLog]),
        UserModule,
    ],
    controllers: [HabitsController],
    providers: [HabitsService],
    exports: [HabitsService],
})
export class HabitsModule {}