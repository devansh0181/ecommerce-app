# prompt :
```
great
now i want to know each and every file explaination that related to authintaction
i am beign honest with you all the code that is written by AI , but i want to know what does it do why we need it , each and every line with core concept

please do the needful
```

# Auth Module Dependency Graph
```
┌──────────────────────────────────────────────────┐
│              AuthModule                          │
├──────────────────────────────────────────────────┤
│ imports:                                         │
│  - TypeOrmModule (User entity)                   │
│  - PassportModule (JWT strategy setup)           │
│  - ConfigModule (load environment vars)          │
│  - JwtModule (token creation)                    │
│                                                  │
│ providers:                                       │
│  - AuthService (register, login, generateToken)  │
│  - JwtStrategy (validate tokens)                 │
│                                                  │
│ controllers:                                     │
│  - AuthController (/auth/register, /auth/login)  │
│                                                  │
│ exports:                                         │
│  - AuthService (for other modules)               │
│  - JwtStrategy (for guards in other modules)     │
│  - PassportModule (for defauklt strategy)        │
└──────────────────────────────────────────────────┘
```
# COMPLETE AUTHENTICATION FLOW DIAGRAM
1. Registration Flow
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Frontend: POST /api/auth/register              ┃
┃ {email, password, firstName, lastName, role}   ┃
┗━━━━━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
             ↓
┌─────────────────────────────────────────────────┐
│ AuthController.register(@Body() registerDto)    │
│ - Pipes validate against RegisterDto rules      │
│ - @IsEmail(), @MinLength(), @IsEnum() etc       │
└────────────┬────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────┐
│ AuthService.register(registerDto)               │
│ 1. Check if email already exists in DB          │
│    └─ If exists → throw ConflictException (409) │
│                                                 │
│ 2. Hash password with bcrypt                    │
│    "myPassword" → "$2b$10$...hash..."           │
│                                                 │
│ 3. Create User entity:                          │
│    {email, hashedPassword, role, name, phone}   │
│                                                 │
│ 4. Save to database (INSERT)                    │
│    DB now has user with id, createdAt, etc      │
│                                                 │
│ 5. Generate JWT token:                          │
│    payload = {sub: userId, email, role}         │
│    token = sign(payload) using JWT_SECRET       │
│                                                 │
│ 6. Return AuthResponseDto:                      │
│    {accessToken, user {id, email, role, ...}}   │
└────────────┬────────────────────────────────────┘
             ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Response (201 Created):                        ┃
┃ {                                              ┃
┃   "accessToken": "eyJhbGc...",                 ┃
┃   "user": {                                    ┃
┃     "id": "uuid-123",                          ┃
┃     "email": "john@example.com",               ┃
┃     "role": "CUSTOMER",                        ┃
┃     "firstName": "John",                       ┃
┃     "lastName": "Doe"                          ┃
┃   }                                            ┃
┃ }                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Frontend stores token in localStorage:
localStorage.setItem('token', accessToken)
```
2. Login Flow
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Frontend: POST /api/auth/login          ┃
┃ {email, password}                       ┃
┗━━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
          ↓
┌──────────────────────────────────────────┐
│ AuthController.login(@Body() loginDto)   │
│ - Validate: email is valid email         │
│ - Validate: password is not empty        │
└────────┬─────────────────────────────────┘
         ↓
┌──────────────────────────────────────────┐
│ AuthService.login(loginDto)              │
│ 1. Find user by email in DB              │
│    └─ If not found → throw Unauthorized  │
│                                          │
│ 2. Compare provided password with DB:    │
│    bcrypt.compare(provided, hashed)      │
│    └─ If mismatch → throw Unauthorized   │
│                                          │
│ 3. Generate JWT token (same as register) │
│                                          │
│ 4. Return AuthResponseDto                │
└────────┬─────────────────────────────────┘
         ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Response (200 OK): AuthResponseDto       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Frontend stores token (same as register)
```
3. Accessing Protected Routes
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Frontend: GET /api/auth/me                  ┃
┃ Header: Authorization: Bearer TOKEN         ┃
┗━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         ↓
┌─────────────────────────────────────────────┐
│ @UseGuards(JwtAuthGuard)                    │
│ ├─ Extracts token from Authorization header │
│ ├─ Verifies signature using JWT_SECRET      │
│ ├─ Checks token not expired                 │
│ └─ Decodes payload: {sub, email, role}      │
└───────┬───────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│ JwtStrategy.validate(payload)               │
│ 1. Extract userId from payload.sub          │
│ 2. Query DB: Find user with this id         │
│    └─ If not found → throw Unauthorized    │
│ 3. Return User object                       │
│    └─ Attach to request.user                │
└───────┬───────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│ @CurrentUser() user: User                   │
│ ├─ Extracts request.user                    │
│ └─ Passes as parameter to handler           │
└───────┬───────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│ Handler executes with authenticated user    │
│ async getProfile(@CurrentUser() user: User) │
│   // user = {id, email, role, ...}          │
└────────────────────────────────────────────┘
```
4.Role-Based Access Control
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Frontend: POST /api/salon/create              ┃
┃ Header: Authorization: Bearer TOKEN           ┃
┗━━━━┬━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
     ↓
┌─────────────────────────────────────┐
│ @Post('create')                     │
│ @UseGuards(JwtAuthGuard)            │
│ @UseGuards(RolesGuard)              │
│ @Roles(UserRole.BARBER)             │
└─────┬───────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│ JwtAuthGuard (Authentication)       │
│ Is token valid & not expired?        │
│ YES → Continue                       │
│ NO → 401 Unauthorized                │
└─────┬───────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│ RolesGuard (Authorization)          │
│ 1. Read @Roles() metadata:          │
│    requiredRoles = [BARBER]         │
│                                     │
│ 2. Get user from request            │
│                                     │
│ 3. Check: user.role in requiredRoles┃
│    User is BARBER → YES → Continue  │
│    User is CUSTOMER → NO → 403       │
└─────┬───────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│ Handler executes (BARBER only)      │
└─────────────────────────────────────┘
```
# Authentication & Backend Core Concepts
1. JWT Token
- **What:** Signed digital passport proving identity.
- **Why:** Enables stateless authentication (no server-side sessions).

---

2. bcrypt Hash
- **What:** One-way password hashing algorithm.
- **Why:** Protects passwords even if database is hacked.

---

3. Salt Rounds (10)
- **What:** Number of hashing iterations.
- **Why:** Higher rounds increase security (10 is balanced).

---

4. Token Expiration (7d)
- **What:** Token becomes invalid after 7 days.
- **Why:** Reduces risk if token is stolen.

---

5. JWT Secret
- **What:** Private key used to sign JWT tokens.
- **Why:** Prevents fake token generation.

---

6. Guard
- **What:** Middleware executed before route handler.
- **Why:** Enforces authentication & authorization.

---

7. Strategy
- **What:** Passport.js validation logic.
- **Why:** Reusable authentication mechanism.

---

8. Decorator
- **What:** Metadata/parameter injection mechanism.
- **Why:** Clean and reusable syntax.

---

9. DTO
- **What:** Data validation contract.
- **Why:** Ensures only valid data enters service layer.

---

10. Repository
- **What:** Database abstraction layer.
- **Why:** Structured and type-safe DB operations.

---

11. Dependency Injection
- **What:** Framework provides required dependencies.
- **Why:** Decoupled, modular, testable code.

---

12. Metadata
- **What:** Extra information attached to classes/functions.
- **Why:** Used by decorators like RolesGuard.