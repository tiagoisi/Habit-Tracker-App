import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePointsDto } from './dto/update-points.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Verificar si el email ya existe
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email }
        });

        if (existingUser) {
            throw new BadRequestException('El email ya está registrado');
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Crear usuario
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return await this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            select: ['id', 'email', 'name', 'points', 'level', 'avatar', 'isActive', 'createdAt'],
            order: { points: 'DESC' } // Ordenar por puntos (ranking)
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'email', 'name', 'points', 'level', 'avatar', 'isActive', 'createdAt', 'updatedAt'],
            relations: ['habits', 'achievements']
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return user;
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'name', 'points', 'level', 'isActive']
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        // Si se actualiza el email, verificar que no exista
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email }
            });

            if (existingUser) {
                throw new BadRequestException('El email ya está en uso');
            }
        }

        // Si se actualiza la contraseña, hashearla
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        Object.assign(user, updateUserDto);
        return await this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }

    async softDelete(id: string): Promise<User> {
        const user = await this.findOne(id);
        user.isActive = false;
        return await this.userRepository.save(user);
    }

    // Métodos para gamificación
    async addPoints(id: string, updatePointsDto: UpdatePointsDto): Promise<User> {
        const user = await this.findOne(id);
        user.points += updatePointsDto.points;

        // Calcular nivel basado en puntos (cada 100 puntos = 1 nivel)
        user.level = Math.floor(user.points / 100) + 1;

        return await this.userRepository.save(user);
    }

    async getLeaderboard(limit: number = 10): Promise<User[]> {
        return await this.userRepository.find({
            select: ['id', 'name', 'points', 'level', 'avatar'],
            where: { isActive: true },
            order: { points: 'DESC' },
            take: limit
        });
    }

    async getUserStats(id: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['habits', 'achievements']
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return {
            // totalHabits: user.habits?.length || 0,
            // totalAchievements: user.achievements?.length || 0,
            points: user.points,
            level: user.level,
            nextLevelPoints: (user.level * 100) - user.points
        };
    }
}