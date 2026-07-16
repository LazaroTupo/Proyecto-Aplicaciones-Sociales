import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, ...rest } = registerDto;
    
    // Check if email is already in use
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await this.usersService.create({
      ...rest,
      email,
      password: hashedPassword,
    });

    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = newUser;

    // Generate token
    const payload = { email: newUser.email, sub: newUser.id, role: newUser.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      id: newUser.id,
      email: newUser.email,
      accessToken,
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    console.log(loginDto.email);
    console.log(loginDto.password);
    
    console.log('user');
    console.log(user);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(loginDto.password, user.password);

    console.log('isPasswordMatching');
    console.log(isPasswordMatching);
    
    
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // Simple refresh token

    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken);
      const user = await this.usersService.getMe(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      const newPayload = { email: user.email, sub: user.id, role: user.role };
      
      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
