import { PartialType } from '@nestjs/swagger';
import { CreateRemontDto } from './create-remont.dto';

export class UpdateRemontDto extends PartialType(CreateRemontDto) {}
