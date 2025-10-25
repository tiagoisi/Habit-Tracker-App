import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional({
        description: 'Nombre del usuario',
        example: 'Juan Pérez'
    })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name?: string;

    @ApiPropertyOptional({
        description: 'URL del avatar del usuario',
        example: 'https://avatar.example.com/user.jpg'
    })
    @IsOptional()
    @IsUrl()
    @MaxLength(200)
    avatar?: string;
}