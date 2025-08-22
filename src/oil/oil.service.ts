import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOilDto } from './dto/create-oil.dto';
import { UpdateOilDto } from './dto/update-oil.dto';
import { PaginationDto, SortOrder } from './dto/pagination-query.dto';

@Injectable()
export class OilService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOilDto) {
    try {
      const created = await this.prisma.oil.create({
        data: {
          ...(dto.date ? { date: new Date(dto.date) } : {}), // yuborilmasa default(now())
          liters: dto.liters,
          price: dto.price,
          note: dto.note,
        },
      });
      return { message: 'Oil created', data: created };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findAll(query: PaginationDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = SortOrder.DESC,
      search,
      dateFrom,
      dateTo,
      minLiters,
      maxLiters,
      minPrice,
      maxPrice,
    } = query;

    const allowedSort = ['date', 'liters', 'price', 'note', 'createdAt'];
    if (!allowedSort.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const where: any = {};

    if (search) {
      where.OR = [{ note: { contains: search, mode: 'insensitive' } }];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo)   where.date.lte = new Date(dateTo);
    }

    if (minLiters !== undefined || maxLiters !== undefined) {
      where.liters = {};
      if (minLiters !== undefined) where.liters.gte = minLiters;
      if (maxLiters !== undefined) where.liters.lte = maxLiters;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    try {
      const [data, total, sumAgg] = await this.prisma.$transaction([
        this.prisma.oil.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.prisma.oil.count({ where }),
        this.prisma.oil.aggregate({
          where,
          _sum: { liters: true, price: true },
        }),
      ]);

      const sumLiters = sumAgg?._sum?.liters ?? 0;
      const sumPrice  = sumAgg?._sum?.price  ?? 0;

      return {
        data,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
          sumLiters,
          sumPrice,
          sortBy,
          sortOrder,
          filters: { search, dateFrom, dateTo, minLiters, maxLiters, minPrice, maxPrice },
        },
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOne(id: number) {
    const row = await this.prisma.oil.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Oil not found');
    return { data: row };
  }

  async update(id: number, dto: UpdateOilDto) {
    const exists = await this.prisma.oil.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Oil not found');

    try {
      const updated = await this.prisma.oil.update({
        where: { id },
        data: {
          ...(dto.date   ? { date: new Date(dto.date) } : {}),
          ...(dto.liters !== undefined ? { liters: dto.liters } : {}),
          ...(dto.price  !== undefined ? { price: dto.price } : {}),
          ...(dto.note   !== undefined ? { note: dto.note } : {}),
        },
      });
      return { message: 'Oil updated', data: updated };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(id: number) {
    const exists = await this.prisma.oil.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Oil not found');

    try {
      const deleted = await this.prisma.oil.delete({ where: { id } });
      return { message: 'Oil deleted', data: deleted };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
