import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { PaginationDto, SortOrder } from './dto/pagination-query.dto';

@Injectable()
export class FoodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFoodDto) {
    try {
      const created = await this.prisma.food.create({
        data: {
          ...(dto.date ? { date: new Date(dto.date) } : {}), // yuborilmasa default(now())
          shopName: dto.shopName,
          amount: dto.amount,
          comment: dto.comment,
        },
      });
      return { message: 'Food created', data: created };
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
      shopName,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
    } = query;

    const allowedSort = ['date', 'amount', 'shopName', 'comment', 'createdAt'];
    if (!allowedSort.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }

    const where: any = {};

    if (search) {
      where.OR = [
        { shopName: { contains: search, mode: 'insensitive' } },
        { comment:  { contains: search, mode: 'insensitive' } },
      ];
    }

    if (shopName) {
      where.shopName = { contains: shopName, mode: 'insensitive' };
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo)   where.date.lte = new Date(dateTo);
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    const skip = (page - 1) * limit;

    try {
      const [data, total, sumAgg] = await this.prisma.$transaction([
        this.prisma.food.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        this.prisma.food.count({ where }),
        this.prisma.food.aggregate({
          where,
          _sum: { amount: true },
        }),
      ]);

      const sumAmount = sumAgg?._sum?.amount ?? 0;

      return {
        data,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
          sumAmount,
          sortBy,
          sortOrder,
          filters: { search, shopName, dateFrom, dateTo, minAmount, maxAmount },
        },
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findOne(id: number) {
    const row = await this.prisma.food.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Food not found');
    return { data: row };
  }

  async update(id: number, dto: UpdateFoodDto) {
    const exists = await this.prisma.food.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Food not found');

    try {
      const updated = await this.prisma.food.update({
        where: { id },
        data: {
          ...(dto.date ? { date: new Date(dto.date) } : {}),
          ...(dto.shopName !== undefined ? { shopName: dto.shopName } : {}),
          ...(dto.amount   !== undefined ? { amount: dto.amount } : {}),
          ...(dto.comment  !== undefined ? { comment: dto.comment } : {}),
        },
      });
      return { message: 'Food updated', data: updated };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(id: number) {
    const exists = await this.prisma.food.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Food not found');

    try {
      const deleted = await this.prisma.food.delete({ where: { id } });
      return { message: 'Food deleted', data: deleted };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
