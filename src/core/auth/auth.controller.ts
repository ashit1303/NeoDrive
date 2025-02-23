import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards, UsePipes } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginReqDTO,  LoginResDTO, RegisterResDTO, TokenDTO } from './auth.schema';
import { JoiValidate } from "../joi/joi.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
// import joiToSwagger from "joi-to-swagger";
import { StandardErrorResponse } from "../http-exception.filter";
import { AuthGuard } from "@nestjs/passport";
import { BaseResponse } from "../response.interceptor";


// const { swagger: loginReqSwagger } = joiToSwagger(loginReq);
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}
        
    // Register a user
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register' })
    @ApiBody({ type :LoginReqDTO })
    @ApiResponse({ status: 201, description: 'User registered successfully', type: RegisterResDTO  })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed',type: StandardErrorResponse })
    async registerUser( @Body() dto : LoginReqDTO) {
        const data = await this.authService.register(dto);
        return data;
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login' })
    @ApiBody({ type: LoginReqDTO })
    @ApiResponse({ status: 201, description: 'User logged in successfully', type: LoginResDTO })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed',type: StandardErrorResponse })
    // @UsePipes(t)
    async login( @Body() body: LoginReqDTO )   {
        const data = await this.authService.login(body);
        return {token : data}
    } 

    @Post('password-reset')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Password Reset' })
    @ApiBody({ type :LoginReqDTO })
    @ApiResponse({ status: 201, description: 'Password changed successfully',  })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed',type: StandardErrorResponse })
    async passwordChange( @Body() body: LoginReqDTO ) {
        const data = await this.authService.passwordChange(body);
        return data;
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