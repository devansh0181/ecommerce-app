import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, role, firstName, lastName, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      phone,
    });

    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Login existing user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Check whether an email is available for registration
   */
  async isEmailAvailable(email: string): Promise<{ available: boolean }> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    return {
      available: !existingUser,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { firstName, lastName, phone, password } = updateDto;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    return this.userRepository.save(user);
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Validate user by ID (used by JWT Strategy)
   */
  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Request password reset token and send email
   */
  async forgotPassword(forgotDto: ForgotPasswordDto): Promise<{ message: string; resetToken?: string }> {
    const { email } = forgotDto;
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email. Please check your spelling or sign up.');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry

    await this.userRepository.save(user);

    // Setup Nodemailer
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailUser = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    let transporter;
    if (pass) {
      transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: false,
        auth: { user: emailUser, pass },
      });
    } else {
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (err) {
        console.error('Failed to create Ethereal Mail test account:', err);
      }
    }

    const resetUrl = `http://localhost:4200/auth/reset-password?token=${token}`;
    const mailOptions = {
      from: '"QueueCut Service" <noreply@queuecut.com>',
      to: email,
      subject: 'Reset Your QueueCut Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">QueueCut Password Reset</h2>
          <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">Hello,</p>
          <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">We received a request to reset your password for your QueueCut account. Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 14px; color: #4f46e5; word-break: break-all; line-height: 1.6;"><a href="${resetUrl}">${resetUrl}</a></p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} QueueCut. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    if (transporter) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('----------------------------------------------------');
        console.log(`[MAILER] Password reset link sent to ${email}`);
        if (!pass) {
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log(`[MAILER] Ethereal Preview URL: ${previewUrl}`);
        }
        console.log('----------------------------------------------------');
      } catch (err) {
        console.error('Failed to send password reset email:', err);
      }
    } else {
      console.log('----------------------------------------------------');
      console.log(`[MAILER] Fallback: No mailer configured. Link: ${resetUrl}`);
      console.log('----------------------------------------------------');
    }

    return {
      message: 'Reset link generated successfully',
      resetToken: token,
    };
  }

  /**
   * Validate token and update user password
   */
  async resetPassword(resetDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = resetDto;

    // Find user by valid token
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }
}