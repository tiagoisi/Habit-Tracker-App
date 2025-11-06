import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { Achievement } from './entities/achievement.entity';
import { Habit } from 'src/habits/entities/habit.entity';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Achievement, Habit]),
        forwardRef(() => UserModule),
    ],
    controllers: [AchievementsController],
    providers: [AchievementsService],
    exports: [AchievementsService],
})
export class AchievementsModule {}