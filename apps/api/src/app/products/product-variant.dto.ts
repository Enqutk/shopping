import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ProductColorOptionDto {
  @IsString()
  @MaxLength(64)
  name!: string;

  @IsString()
  @Matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
  hex!: string;
}

export class ProductVariantFieldsDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductColorOptionDto)
  availableColors?: ProductColorOptionDto[] | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(32, { each: true })
  availableSizes?: string[] | null;
}
