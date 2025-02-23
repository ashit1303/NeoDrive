
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Users } from 'src/core/models/Users';
import { BaseResponse } from 'src/core/response.interceptor';


export class UserDataDto {  // DTO mirrors the Users entity
  @ApiProperty({ description: 'User ID', example: '12345' })
  @IsString() // Add validation decorators
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User name', example: 'John Doe', nullable: true })
  @IsString()
  @IsOptional()
  name: string | null;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Is user verified?', example: true, nullable: true })
  @IsBoolean()
  @IsOptional()
  isVerified: boolean | null;

  @ApiProperty({ description: 'Creation timestamp' })
  @IsDate()
  @IsOptional()
  createdAt: Date | null;

  @ApiProperty({ description: 'Update timestamp' })
  @IsDate()
  @IsOptional()
  updatedAt: Date | null;

    @ApiProperty({ description: 'Shortened Links' })
    @IsOptional()
    shortendLinks: any[];

    @ApiProperty({ description: 'Files' })
    @IsOptional()
    files: any[];
}

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

export interface AuthenticatedReqDTO extends Request {
    user: Users
}

export class UserResDTO extends BaseResponse<UserDataDto>{
  @ApiProperty({ description: 'Payload', type: UserDataDto})
  data: UserDataDto
}

export class AllUserResDTO extends BaseResponse<UserDataDto[]>{
  @ApiProperty({ description: 'Payload', type: [UserDataDto]})
  data: UserDataDto[]
}