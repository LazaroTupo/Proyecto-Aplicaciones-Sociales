import { Body, Controller, Post, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto.ts/login.dto';
import { RegisterUserDto } from './login.dto.ts/register.dto';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.authService.register(body);
  }
}