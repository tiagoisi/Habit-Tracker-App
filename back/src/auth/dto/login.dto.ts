import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({
        description: 'Email del usuario',
        example: 'juan@example.com'
    })
    @IsNotEmpty({ message: 'El email no puede estar vacío' })
    @IsEmail({}, { message: 'El email debe ser válido' })
    @MaxLength(50)
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'Password123!'
    })
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
    @IsString()
    @MinLength(8)
    password: string;
}