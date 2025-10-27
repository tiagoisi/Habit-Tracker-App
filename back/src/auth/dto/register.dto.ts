import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({
        description: 'Email del usuario',
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
    @MinLength(2)
    @MaxLength(50)
    name: string;
}