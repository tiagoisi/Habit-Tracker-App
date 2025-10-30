import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { Achievement } from './entities/achievement.entity';
import { UserModule } from 'src/user/user.module';
import { UsersService } from 'src/user/user.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Achievement]),
        UserModule,
    ],
    controllers: [AchievementsController],
    providers: [AchievementsService],
    exports: [AchievementsService],
})
export class AchievementsModule {}