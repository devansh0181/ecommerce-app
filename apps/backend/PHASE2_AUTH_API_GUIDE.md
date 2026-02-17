# Phase 2: Authentication API - Complete Guide

## 🎯 Goal
Build a complete JWT-based authentication system with:
- User registration (Customer & Barber roles)
- Login with email/password
- JWT token generation & validation
- Protected routes with Guards
- Current user decorator
- Password hashing

---

## 📋 What We'll Build

### Endpoints:
1. `POST /api/auth/register` - Create new user account
2. `POST /api/auth/login` - Login and get JWT token
3. `GET /api/auth/me` - Get current authenticated user
4. `POST /api/auth/logout` - Logout (optional, token invalidation)

### Security Features:
- Passwords hashed with bcrypt
- JWT tokens with expiration
- Role-based access control (Customer vs Barber)
- Request validation with DTOs
- Error handling

---

## Step 1: Install Required Dependencies (5 minutes)

```bash
# Navigate to your backend folder
cd apps/backend

# Install authentication packages
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt
npm install class-validator class-transformer

# Install types for TypeScript
npm install -D @types/passport-jwt @types/bcrypt
```

---

## Step 2: Create Auth Module Structure (10 minutes)

```bash
# Generate auth module with all components
nest g module modules/auth
nest g service modules/auth
nest g controller modules/auth
```

Your structure should look like:
```
src/modules/auth/
├── auth.module.ts
├── auth.service.ts
├── auth.controller.ts
├── dto/              # We'll create this
├── strategies/       # We'll create this
└── guards/           # We'll create this
```

---

## Step 3: Configure JWT Settings (10 minutes)

### 3.1 Update `.env` file

```env
# Existing database config...

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**⚠️ IMPORTANT:** In production, use a strong random secret (at least 32 characters)

### 3.2 Create JWT Config File

**File: `src/config/jwt.config.ts`**
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
```

### 3.3 Update `app.module.ts` to load JWT config

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config'; // Add this

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig], // Add jwtConfig here
    }),
    // ... rest of your imports
  ],
})
export class AppModule {}
```

---

## Step 4: Create DTOs (Data Transfer Objects) (15 minutes)

DTOs define the shape of data for API requests/responses and include validation rules.

### 4.1 Register DTO

**File: `src/modules/auth/dto/register.dto.ts`**
```typescript
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
```

### 4.2 Login DTO

**File: `src/modules/auth/dto/login.dto.ts`**
```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### 4.3 Auth Response DTO

**File: `src/modules/auth/dto/auth-response.dto.ts`**
```typescript
import { UserRole } from '../../../common/enums';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  };
}
```

### 4.4 Create DTO Index File

**File: `src/modules/auth/dto/index.ts`**
```typescript
export * from './register.dto';
export * from './login.dto';
export * from './auth-response.dto';
```

---

## Step 5: Create JWT Strategy (15 minutes)

The JWT Strategy validates tokens on protected routes.

**File: `src/modules/auth/strategies/jwt.strategy.ts`**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { sub: userId } = payload;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user; // This will be attached to request.user
  }
}
```

---

## Step 6: Create Auth Guards (10 minutes)

Guards protect routes and check authentication/authorization.

### 6.1 JWT Auth Guard

**File: `src/modules/auth/guards/jwt-auth.guard.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 6.2 Roles Guard

**File: `src/modules/auth/guards/roles.guard.ts`**
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../common/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### 6.3 Create Guard Index File

**File: `src/modules/auth/guards/index.ts`**
```typescript
export * from './jwt-auth.guard';
export * from './roles.guard';
```

---

## Step 7: Create Custom Decorators (10 minutes)

Decorators make it easy to get current user and set required roles.

### 7.1 Current User Decorator

**File: `src/common/decorators/current-user.decorator.ts`**
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### 7.2 Roles Decorator

**File: `src/common/decorators/roles.decorator.ts`**
```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

### 7.3 Create Decorator Index File

**File: `src/common/decorators/index.ts`**
```typescript
export * from './current-user.decorator';
export * from './roles.decorator';
```

---

## Step 8: Implement Auth Service (20 minutes)

The service contains the core authentication business logic.

**File: `src/modules/auth/auth.service.ts`**
```typescript
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
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
   * Get current user profile
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Remove password from response
    delete user.password;
    return user;
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
}
```

---

## Step 9: Implement Auth Controller (15 minutes)

The controller handles HTTP requests and responses.

**File: `src/modules/auth/auth.controller.ts`**
```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from '../../common/decorators';
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
   * GET /api/auth/me
   * Get current authenticated user
   * Requires JWT token in Authorization header
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<User> {
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
```

---

## Step 10: Configure Auth Module (10 minutes)

Wire everything together in the auth module.

**File: `src/modules/auth/auth.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}
```

---

## Step 11: Update App Module (5 minutes)

Make sure AuthModule is imported in your main app module.

**File: `src/app.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Import modules
import { AuthModule } from './modules/auth/auth.module'; // Add this
import { UserModule } from './modules/user/user.module';
import { SalonModule } from './modules/salon/salon.module';
import { ServiceModule } from './modules/service/service.module';
import { BookingModule } from './modules/booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    AuthModule, // Add this
    UserModule,
    SalonModule,
    ServiceModule,
    BookingModule,
  ],
})
export class AppModule {}
```

---

## Step 12: Enable Global Validation (5 minutes)

Ensure DTOs are validated automatically.

**File: `src/main.ts`**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if unknown properties
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📊 Database: Connected to Supabase PostgreSQL`);
}
bootstrap();
```

---

## Step 13: Test the Authentication API (20 minutes)

### 13.1 Start the Application

```bash
npm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:3000/api
📊 Database: Connected to Supabase PostgreSQL
```

### 13.2 Test Endpoints with Postman/Thunder Client/cURL

#### Test 1: Register a Customer

**Request:**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "password123",
  "role": "CUSTOMER",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Expected Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "customer@test.com",
    "role": "CUSTOMER",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Test 2: Register a Barber

**Request:**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "barber@test.com",
  "password": "password123",
  "role": "BARBER",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+0987654321"
}
```

**Expected Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "barber@test.com",
    "role": "BARBER",
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

#### Test 3: Login

**Request:**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "customer@test.com",
    "role": "CUSTOMER",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Test 4: Get Current User (Protected Route)

**Request:**
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your-token-here>
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "email": "customer@test.com",
  "role": "CUSTOMER",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "createdAt": "2024-02-15T10:00:00.000Z",
  "updatedAt": "2024-02-15T10:00:00.000Z"
}
```

#### Test 5: Test Invalid Login

**Request:**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "wrongpassword"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

#### Test 6: Test Duplicate Registration

**Request:**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "password123",
  "role": "CUSTOMER",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Expected Response (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

## 📁 Final Folder Structure

```
src/
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts ✅
│   │   ├── roles.decorator.ts ✅
│   │   └── index.ts ✅
│   ├── entities/
│   │   └── base.entity.ts
│   └── enums/
│       ├── user-role.enum.ts
│       ├── booking-status.enum.ts
│       ├── day-of-week.enum.ts
│       └── index.ts
│
├── config/
│   ├── database.config.ts
│   └── jwt.config.ts ✅
│
├── entities/
│   └── user.entity.ts (already created)
│
├── modules/
│   └── auth/
│       ├── dto/
│       │   ├── register.dto.ts ✅
│       │   ├── login.dto.ts ✅
│       │   ├── auth-response.dto.ts ✅
│       │   └── index.ts ✅
│       ├── guards/
│       │   ├── jwt-auth.guard.ts ✅
│       │   ├── roles.guard.ts ✅
│       │   └── index.ts ✅
│       ├── strategies/
│       │   └── jwt.strategy.ts ✅
│       ├── auth.module.ts ✅
│       ├── auth.service.ts ✅
│       └── auth.controller.ts ✅
│
├── app.module.ts (updated) ✅
└── main.ts (updated) ✅
```

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Application starts without errors
- [ ] Can register a new customer user
- [ ] Can register a new barber user
- [ ] Cannot register duplicate email
- [ ] Can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] Can access `/api/auth/me` with valid token
- [ ] Cannot access `/api/auth/me` without token
- [ ] Passwords are hashed in database (check Supabase)
- [ ] JWT tokens contain correct payload (decode at jwt.io)

---

## 🔒 Security Best Practices Implemented

✅ **Password Hashing:** Bcrypt with salt rounds (10)  
✅ **JWT Expiration:** Tokens expire after 7 days  
✅ **Input Validation:** DTOs with class-validator  
✅ **SQL Injection Prevention:** TypeORM parameterized queries  
✅ **Email Uniqueness:** Database constraint + application check  
✅ **Error Messages:** Generic "Invalid email or password" (no user enumeration)  
✅ **CORS Protection:** Configured for specific frontend origin  
✅ **No Password in Response:** Excluded from all API responses

---

## 🆘 Common Issues & Solutions

### Issue 1: "Unauthorized" on all protected routes
**Solution:** Check Authorization header format: `Bearer <token>` (note the space)

### Issue 2: JWT token decode fails
**Solution:** Verify `JWT_SECRET` in `.env` matches what was used to sign token

### Issue 3: ValidationPipe not working
**Solution:** Ensure `class-validator` and `class-transformer` are installed

### Issue 4: "Cannot find module 'bcrypt'"
**Solution:** 
```bash
npm uninstall bcrypt
npm install bcrypt --build-from-source
```

### Issue 5: "User not found" after login
**Solution:** Check JWT Strategy is correctly validating user ID from token payload

---

## 🚀 What's Next?

After authentication is working, you can:

1. **Create Protected Endpoints** - Use `@UseGuards(JwtAuthGuard)` on other controllers
2. **Add Role-Based Access** - Use `@Roles(UserRole.BARBER)` decorator
3. **Implement Refresh Tokens** - For better security (optional)
4. **Add Email Verification** - Verify user emails (optional)
5. **Move to Phase 3** - Salon Management APIs

---

## 🎯 Example: Using Auth in Other Modules

Here's how you'll use authentication in future modules:

**Example: Protected Salon Creation (Barber Only)**
```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BARBER)
async createSalon(
  @CurrentUser() user: User,
  @Body() createSalonDto: CreateSalonDto,
) {
  return this.salonService.create(user.id, createSalonDto);
}
```

---

## 📚 Testing with REST Client Extension (VS Code)

Create a file: `test-auth.http`

```http
### Variables
@baseUrl = http://localhost:3000/api
@token = {{login.response.body.accessToken}}

### Register Customer
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "password123",
  "role": "CUSTOMER",
  "firstName": "John",
  "lastName": "Doe"
}

### Register Barber
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "barber@test.com",
  "password": "password123",
  "role": "BARBER",
  "firstName": "Jane",
  "lastName": "Smith"
}

### Login
# @name login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "password123"
}

### Get Current User
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
```

---

**Congratulations! 🎉** 

You now have a complete, production-ready authentication system. Users can register, login, and access protected routes. All passwords are securely hashed, and JWT tokens handle authentication.

**Ready for next steps?** Let me know and we'll build the Salon Management APIs next!
