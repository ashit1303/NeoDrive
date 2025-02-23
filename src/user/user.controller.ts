import { Controller, Get, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { JoiValidate } from '../core/joi/joi.service';
import { AllUserResDTO, AuthenticatedReqDTO, PageDto, UserResDTO} from './dto';
// import joiToSwagger from 'joi-to-swagger';
import { StandardErrorResponse } from '../core/http-exception.filter';
import { JwtGaurd } from 'src/core/auth/gaurd';
// import { Request } from 'express';



// const { swagger: pageSwagger } = joiToSwagger(pageDto);
@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // @Get()
    // @ApiOperation({ summary: 'Get all users' })
    // @ApiQuery({ name:'page', description:'Page Number' })
    // @ApiQuery({ name:'pageSize', description:'Page Size' })
    // @UseGuards(JwtGaurd)
    // @ApiResponse({ status: 200, description: 'Get all users' })
    // @ApiResponse({ status: 400, description: 'Bad Request. Validation failed', type: StandardErrorResponse })
    // // @UsePipes()
    // async getAllUsers(
    //     @Query('page', ParseIntPipe) page: number, // Use ParseIntPipe
    //     @Query('pageSize', ParseIntPipe) pageSize: number,
    // ) {
    //     const data = await this.userService.getAllUsers(page, pageSize);
    //     return {data}
    //     // return 
    // }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    // @ApiQuery({ type: PageDto })
    @UseGuards(JwtGaurd)
    @ApiResponse({ status: 200, description: 'Get all users', type: AllUserResDTO })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed', type: StandardErrorResponse })
    // @UsePipes()
    async getAllUsers(
        @Query() page: PageDto,
    ) {
        const data = await this.userService.getAllUsers(page);
        return {data}
        // return 
    }

    @Get('me')
    @ApiOperation({ summary: 'Get user by Id' })
    @ApiResponse({ status: 200, description: 'Get user by Id', type: UserResDTO  })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed', type: StandardErrorResponse })
    @UseGuards(JwtGaurd)
    async getMyProfile(@Req() req: AuthenticatedReqDTO) {
        return await this.userService.getMyProfile(req.user.id);
    }

}
