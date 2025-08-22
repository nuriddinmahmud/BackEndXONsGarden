import { Module } from '@nestjs/common';
import { OilService } from './oil.service';
import { OilController } from './oil.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [OilController],
  providers: [OilService, PrismaService],
})
export class OilModule {}
