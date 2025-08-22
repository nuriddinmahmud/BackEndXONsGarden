import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterAuthDto) {
    return await this.auth.register(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return await this.auth.verifyEmail(dto);
  }

  @Post('resend-code')
  async resend(@Body() dto: ResendCodeDto) {
    return await this.auth.resendCode(dto.email);
  }

  @Post('login')
  async login(@Body() dto: LoginAuthDto) {
    return await this.auth.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return await this.auth.getProfile(req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('users')
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return await this.auth.getAllUsers();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('users/:id')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.auth.deleteUserById(id);
  }
}
