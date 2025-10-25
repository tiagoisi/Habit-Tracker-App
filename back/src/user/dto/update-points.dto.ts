import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdatePointsDto {
    @ApiProperty({
        description: 'Cantidad de puntos a añadir o restar',
        example: 10
    })
    @IsNotEmpty()
    @IsNumber()
    points: number;
}