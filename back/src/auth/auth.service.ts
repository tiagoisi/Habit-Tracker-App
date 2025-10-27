import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        // Verificar si el usuario ya existe
        const existingUser = await this.usersService.findOneByEmail(registerDto.email);
        
        if (existingUser) {
            throw new BadRequestException('El email ya está registrado');
        }

        // Crear el usuario (el hash de la contraseña se hace en UsersService)
        const user = await this.usersService.create(registerDto);

        // Generar token
        const payload = { sub: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        return {
            message: 'Usuario registrado exitosamente',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                points: user.points,
                level: user.level
            },
            token
        };
    }

    async login(loginDto: LoginDto) {
        // Buscar usuario por email
        const user = await this.usersService.findOneByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Verificar si el usuario está activo
        if (!user.isActive) {
            throw new UnauthorizedException('La cuenta está desactivada');
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Generar token
        const payload = { sub: user.id, email: user.email };
        const token = this.jwtService.sign(payload);

        return {
            message: 'Login exitoso',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                points: user.points,
                level: user.level
            },
            token
        };
    }

    async validateUser(userId: string): Promise<User> {
        const user = await this.usersService.findOne(userId);
        
        if (!user || !user.isActive) {
            throw new UnauthorizedException('Usuario no válido');
        }

        return user;
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findOne(userId);
        
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            points: user.points,
            level: user.level,
            avatar: user.avatar,
            createdAt: user.createdAt
        };
    }
}