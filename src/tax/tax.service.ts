import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TaxService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTaxDto) {
    return this.prisma.tax.create({ data: dto });
  }

  async findAll(pagination: PaginationQueryDto) {
    const { skip, limit, search, sortBy, sortOrder } = pagination;

    const where: Prisma.TaxWhereInput | undefined = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { comment: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tax.findMany({
        skip,
        take: limit,
        where,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { date: 'desc' },
      }),
      this.prisma.tax.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page: pagination.page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
