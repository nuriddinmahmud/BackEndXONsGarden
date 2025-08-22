import { PartialType } from '@nestjs/swagger';
import { CreateOilDto } from './create-oil.dto';

export class UpdateOilDto extends PartialType(CreateOilDto) {}
