
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Users } from 'src/core/models/Users';


export class PageDto {
    @ApiProperty({ description: 'Page number', default: 1, required: false })
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @IsOptional()
    page: number = 1;
  
    @ApiProperty({ description: 'Page size', default: 10, required: false })
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @IsOptional()
    pageSize: number = 10;
  
    @ApiProperty({ description: 'Search term', required: false })
    @IsString()
    @IsOptional()
    search: string;
  
    @ApiProperty({ description: 'Sort by field', required: false })
    @IsString()
    @IsOptional()
    sortBy: string;
  
    @ApiProperty({ description: 'Sort order (asc or desc)', required: false, enum: ['asc','desc'] })
    @IsString()
    @IsOptional()
    sortOrder: string = 'asc'; // Default sort order
  
    // ... other query parameters you might have
  }

export interface RequestWithUser extends Request {
    user: Users
}