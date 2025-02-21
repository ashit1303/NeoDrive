import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards, UsePipes } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginReq,  LoginRes } from './auth.schema';
import { JoiValidate } from "../joi/joi.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
// import joiToSwagger from "joi-to-swagger";
import { StandardErrorResponse } from "../http-exception.filter";
import { AuthGuard } from "@nestjs/passport";


// const { swagger: loginReqSwagger } = joiToSwagger(loginReq);
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login' })
    @ApiBody({ type: LoginReq })
    @ApiResponse({ status: 201, description: 'User logged in successfully', type: LoginRes })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed',type: StandardErrorResponse })
    // @UsePipes(t)
    async login( @Req() body: LoginReq )   {
        return await this.authService.login(body);
    } 

    @Post('password-reset')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Register' })
    @ApiBody({ type :LoginReq })
    @ApiResponse({ status: 201, description: 'password changed successfully',  })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed',type: StandardErrorResponse })
    async register( @Body() body: LoginReq ) {
        return this.authService.passwordChange(body);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt')) // Or just @UseGuards(AuthGuard())
    @ApiBearerAuth('JWT') // Swagger: Indicate bearer token authentication
    @ApiOperation({ summary: 'Verify OTP' })
    @ApiResponse({ status: 200, description: 'OTP verified successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed', type: StandardErrorResponse })
    async verifyOtp(@Body() data: { otp: string }) {

        // Implement OTP verification logic here
        return { message: 'OTP verified successfully' };
    }

}
export default AuthController; 