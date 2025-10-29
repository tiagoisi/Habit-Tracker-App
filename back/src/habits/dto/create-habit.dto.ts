import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { HabitFrequency } from "../entities/habit.entity";

export class CreateHabitDto {
    @ApiProperty({
        description: 'Título del hábito',
        example: 'Hacer ejercicio'
    })
    @IsNotEmpty({ message: 'El título no puede estar vacío' })
    @IsString()
    @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
    @MaxLength(100)
    title: string;

    @ApiPropertyOptional({
        description: 'Descripción del hábito',
        example: '30 minutos de cardio en el gimnasio'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({
        description: 'Frecuencia del hábito',
        enum: HabitFrequency,
        example: HabitFrequency.DAILY
    })
    @IsEnum(HabitFrequency, { message: 'La frecuencia debe ser daily, weekly o custom' })
    frequency: HabitFrequency;

    @ApiPropertyOptional({
        description: 'Icono del hábito (emoji)',
        example: '💪'
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    icon?: string;

    @ApiPropertyOptional({
        description: 'Color del hábito en formato hex',
        example: '#3b82f6'
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    color?: string;
}
