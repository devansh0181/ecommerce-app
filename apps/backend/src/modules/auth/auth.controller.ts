import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Register a new user
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * GET /api/auth/check-email?email=
   * Check whether an email is available for registration
   */
  @Get('check-email')
  async checkEmailAvailability(@Query('email') email: string): Promise<{ available: boolean }> {
    return this.authService.isEmailAvailable(email);
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user
   * Requires JWT token in Authorization header
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<Partial<User>> {
    // Password is already excluded in service
    return this.authService.getProfile(user.id);
  }

  /**
   * POST /api/auth/logout
   * Logout (client-side token removal)
   * No server-side action needed for stateless JWT
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(): { message: string } {
    return {
      message: 'Logged out successfully. Please remove token from client.',
    };
  }
}