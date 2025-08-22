import { Module } from '@nestjs/common';
import { EnergyService } from './energy.service';
import { EnergyController } from './energy.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EnergyController],
  providers: [EnergyService, PrismaService],
})
export class EnergyModule {}
