
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';


export class PageDto {
    @ApiProperty({ description: 'Page number' })
    @IsNumber()
    @Min(1)
    page: number;
    @ApiProperty({ description: 'Page size' })
    @IsNumber()
    @Min(1)
    pageSize: number;
}
