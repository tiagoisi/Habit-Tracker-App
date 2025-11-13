import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, Query, UseInterceptors, BadRequestException, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { UpdatePointsDto } from './dto/update-points.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos o email ya existe' })
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios' })
    async findAll() {
        return await this.usersService.findAll();
    }

    @Get('leaderboard')
    @ApiOperation({ summary: 'Obtener el ranking de usuarios por puntos' })
    @ApiResponse({ status: 200, description: 'Top usuarios por puntos' })
    async getLeaderboard(@Query('limit') limit?: number) {
        return await this.usersService.getLeaderboard(limit || 10);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario encontrado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return await this.usersService.findOne(id);
    }

    @Get(':id/stats')
    @ApiOperation({ summary: 'Obtener estadísticas del usuario' })
    @ApiResponse({ status: 200, description: 'Estadísticas del usuario' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async getUserStats(@Param('id', ParseUUIDPipe) id: string) {
        return await this.usersService.getUserStats(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un usuario' })
    @ApiResponse({ status: 200, description: 'Usuario actualizado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        return await this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/points')
    @ApiOperation({ summary: 'Añadir o restar puntos a un usuario' })
    @ApiResponse({ status: 200, description: 'Puntos actualizados' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async addPoints(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePointsDto: UpdatePointsDto
    ) {
        return await this.usersService.addPoints(id, updatePointsDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un usuario (hard delete)' })
    @ApiResponse({ status: 204, description: 'Usuario eliminado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return await this.usersService.remove(id);
    }

    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Desactivar un usuario (soft delete)' })
    @ApiResponse({ status: 200, description: 'Usuario desactivado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async softDelete(@Param('id', ParseUUIDPipe) id: string) {
        return await this.usersService.softDelete(id);
    }

     // ✅ NUEVO: Subir avatar
    @Post(':id/avatar')
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads/avatars',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `avatar-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                    return cb(new BadRequestException('Solo se permiten imágenes'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        }),
    )
        
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Subir avatar del usuario' })
    async uploadAvatar(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ninguna imagen');
        }

        const avatarUrl = `/uploads/avatars/${file.filename}`;
        return await this.usersService.update(id, { avatar: avatarUrl });
    }

    // ✅ NUEVO: Eliminar avatar
    @Delete(':id/avatar')
    @ApiOperation({ summary: 'Eliminar avatar del usuario' })
    async deleteAvatar(@Param('id', ParseUUIDPipe) id: string) {
        return await this.usersService.update(id, { avatar: undefined });
    }
}