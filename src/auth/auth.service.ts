import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import * as bcrypt from 'bcrypt';
import nodemailer, { Transporter } from 'nodemailer';
import { UserRole, UserStatus } from '@prisma/client';

const CODE_TTL_MIN = Number(process.env.EMAIL_CODE_TTL_MIN || 15);

@Injectable()
export class AuthService {
  private transporter: Transporter;

  constructor(private prisma: PrismaService, private jwt: JwtService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
  }

  async register(dto: RegisterAuthDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('❌ Bu email allaqachon roʻyxatdan oʻtgan');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: dto.role ?? UserRole.USER,
        status: dto.status ?? UserStatus.ACTIVE,
      },
    });

    try {
      const code = await this.issueEmailCode(user.id);
      await this.sendVerifyMail(user.email, user.name, code);
    } catch (e) {
      console.error('❌ Email yuborishda xatolik:', e.message);
    }

    return {
      message: '✅ Roʻyxatdan oʻtdingiz. Emailga kod yuborildi.',
      userId: user.id,
    };
  }

  async login(dto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('❌ Bunday foydalanuvchi topilmadi');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('❌ Parol notoʻgʻri');

    if (!user.isVerified) {
      throw new ForbiddenException('❌ Email tasdiqlanmagan');
    }

    return this.generateToken(user);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('❌ Foydalanuvchi topilmadi');

    const record = await this.prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { id: 'desc' },
    });

    if (!record) {
      throw new ForbiddenException('❌ Kod notoʻgʻri yoki muddati tugagan');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      }),
      this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return this.generateToken(user);
  }

  async resendCode(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('❌ Foydalanuvchi topilmadi');

    if (user.isVerified) {
      return { message: '✅ Foydalanuvchi allaqachon tasdiqlangan' };
    }

    const code = await this.issueEmailCode(user.id);
    try {
      await this.sendVerifyMail(user.email, user.name, code);
    } catch (e) {
      console.error('❌ Email yuborishda xatolik:', e.message);
    }

    return { message: '✅ Kod qayta yuborildi' };
  }

  async getProfile(user: any) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async deleteUserById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('❌ Foydalanuvchi topilmadi');

    await this.prisma.emailVerification.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });

    return { message: '✅ Foydalanuvchi muvaffaqiyatli o‘chirildi' };
  }

  private async issueEmailCode(userId: number) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + CODE_TTL_MIN * 60 * 1000);

    await this.prisma.emailVerification.create({
      data: { userId, code, expiresAt },
    });

    return code;
  }

  private async sendVerifyMail(email: string, name: string, code: string) {
    const app = process.env.APP_NAME || "XON's Garden";
    const frontUrl = process.env.APP_URL || '';

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif">
        <h2>${app} — Email tasdiqlash</h2>
        <p>Salom, <b>${name}</b>!</p>
        <p>Sizning tasdiqlash kodingiz:</p>
        <div style="font-size:24px;letter-spacing:3px;"><b>${code}</b></div>
        <p>Kod ${CODE_TTL_MIN} daqiqa ichida amal qiladi.</p>
        ${
          frontUrl
            ? `<p><a href="${frontUrl}/verify?email=${encodeURIComponent(
                email,
              )}">Tasdiqlash</a></p>`
            : ''
        }
      </div>
    `;

    await this.transporter.sendMail({
      from: `"${app}" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to: email,
      subject: `${app} — Email tasdiqlash kodi: ${code}`,
      html,
    });
  }

  private generateToken(user: {
    id: number;
    email: string;
    role?: string;
    isVerified?: boolean;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: (user as any).role || UserRole.USER,
      isVerified: (user as any).isVerified ?? true,
    };

    return {
      access_token: this.jwt.sign(payload, { expiresIn: '365d' }),
    };
  }
}
