import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Post('register')
    register(@Body() userData: CreateUserDto) {
        return this.authService.register(userData);
    }

    @Post('login')
    login(@Body() loginData: LoginDto) {
        return this.authService.login(loginData.email, loginData.password);
    }
}
