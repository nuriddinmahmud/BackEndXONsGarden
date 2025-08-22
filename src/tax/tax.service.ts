import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class TaxService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTaxDto) {
    return this.prisma.tax.create({ data: dto });
  }

  findAll(pagination: PaginationQueryDto) {
    const { page, limit } = pagination;
    return this.prisma.tax.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.tax.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateTaxDto) {
    return this.prisma.tax.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.tax.delete({ where: { id } });
  }
}
