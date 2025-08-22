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

  async findAll(pagination: PaginationQueryDto) {
    const { skip, limit, search, sortBy, sortOrder } = pagination;

    return this.prisma.tax.findMany({
      skip,
      take: limit,
      where: search
        ? {
            OR: [
              { description: { contains: search, mode: 'insensitive' } },
              { note: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: sortBy ? { [sortBy]: sortOrder } : { date: 'desc' },
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
