import { Controller, Get, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JoiValidate } from '../core/joi/joi.service';
import { PageDto } from './user.dto';
import joiToSwagger from 'joi-to-swagger';
import { StandardErrorResponse } from '../core/http-exception.filter';

// const { swagger: pageSwagger } = joiToSwagger(pageDto);
@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiBody({ type: PageDto })
    @ApiResponse({ status: 200, description: 'Get all users' })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed', type: StandardErrorResponse })
    // @UsePipes()
    async getAllUsers(page: PageDto) {
        return await this.userService.getAllUsers(page);
    }


    @Get(':id')
    @ApiOperation({ summary: 'Get user by Id' })
    @ApiParam({ name: 'id', required: true, description: 'User Id' })
    @ApiResponse({ status: 200, description: 'Get user by Id' })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed', type: StandardErrorResponse })
    // @UsePipes()

    async getUserById(page: PageDto) {
        return await this.userService.getAllUsers(page);
    }

}
