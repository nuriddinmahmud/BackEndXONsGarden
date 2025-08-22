import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransportType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { QueryTransportDto } from './dto/pagination-query.dto';

@Injectable()
export class TransportService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransportDto) {
    const exists = await this.prisma.transport.findUnique({ where: { plate: dto.plate } });
    if (exists) throw new BadRequestException('Plate already exists');

    return this.prisma.transport.create({ data: dto });
  }

async findAll(q: QueryTransportDto) {
    const { page, limit, search, type, sortBy, sortOrder } = q;

    const orFilters: Prisma.TransportWhereInput[] =
      search
        ? [
            {
              plate: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              model: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              note: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ]
        : [];

    let where: Prisma.TransportWhereInput = {};
    if (type) {
      where = { ...where, type: type as TransportType };
    }
    if (orFilters.length) {
      where = { ...where, OR: orFilters };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.transport.count({ where }),
      this.prisma.transport.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        sortBy,
        sortOrder,
      },
    };
  }


  async findOne(id: number) {
    const item = await this.prisma.transport.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Transport not found');
    return item;
  }

  async update(id: number, dto: UpdateTransportDto) {
    if (dto.plate) {
      const exists = await this.prisma.transport.findUnique({ where: { plate: dto.plate } });
      if (exists && exists.id !== id) {
        throw new BadRequestException('Plate already exists');
      }
    }

    try {
      return await this.prisma.transport.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new NotFoundException('Transport not found');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.transport.delete({ where: { id } });
      return { message: 'Deleted' };
    } catch {
      throw new NotFoundException('Transport not found');
    }
  }
}
