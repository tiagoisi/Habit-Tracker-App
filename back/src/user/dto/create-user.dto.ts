import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: 'Email del usuario, debe ser único',
        example: 'juan@example.com'
    })
    @IsNotEmpty({ message: 'El email no puede estar vacío' })
    @IsEmail({}, { message: 'El email debe ser válido' })
    @MaxLength(50)
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario, mínimo 8 caracteres',
        example: 'Password123!'
    })
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @MaxLength(60)
    password: string;

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan Pérez'
    })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    @IsString()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(50)
    name: string;

    @ApiPropertyOptional({
        description: 'URL del avatar del usuario',
        example: 'https://avatar.example.com/user.jpg'
    })
    @IsOptional()
    @IsUrl({}, { message: 'El avatar debe ser una URL válida' })
    @MaxLength(200)
    avatar?: string;
}