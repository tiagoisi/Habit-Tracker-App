import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CompleteHabitDto {
    @ApiPropertyOptional({
        description: 'Notas opcionales al completar el hábito',
        example: 'Me sentí genial hoy'
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}