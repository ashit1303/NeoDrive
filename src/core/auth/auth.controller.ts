import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UsePipes } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginReq, loginReq, LoginRes } from './auth.schema';
import { JoiValidate } from "../joi/joi.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import joiToSwagger from "joi-to-swagger";
import { StandardErrorResponse } from "../http-exception.filter";
import { AuthGuard } from "@nestjs/passport";


const { swagger: loginReqSwagger } = joiToSwagger(loginReq);
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login',description: 'Login user.' })
    @ApiBody({ schema: loginReqSwagger })
    @ApiResponse({ status: 201, description: 'User logged in successfully', type: LoginRes })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed',type: StandardErrorResponse })
    @UsePipes(new JoiValidate(loginReq))
    async login( @Body() data: LoginReq )   {
        return await this.authService.login(data);
    } 

    @Post('password-reset')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Register',description: 'Register user.' })
    @ApiBody({ schema: loginReqSwagger })
    @ApiResponse({ status: 201, description: 'password changed successfully',  })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed',type: StandardErrorResponse })
    async register( @Body() data: LoginReq ) {
        return this.authService.passwordChange(data);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt')) // Or just @UseGuards(AuthGuard())
    @ApiBearerAuth('JWT') // Swagger: Indicate bearer token authentication
    @ApiOperation({ summary: 'Verify OTP', description: 'Verify user OTP.' })
    @ApiResponse({ status: 200, description: 'OTP verified successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed', type: StandardErrorResponse })
    async verifyOtp(@Body() data: { otp: string }) {

        // Implement OTP verification logic here
        return { message: 'OTP verified successfully' };
    }

}
export default AuthController; 