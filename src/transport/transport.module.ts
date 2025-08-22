import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TransportController],
  providers: [TransportService, PrismaService],
})
export class TransportModule {}
