import { Module } from '@nestjs/common';
import { RemontService } from './remont.service';
import { RemontController } from './remont.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RemontController],
  providers: [RemontService, PrismaService],
})
export class RemontModule {}
