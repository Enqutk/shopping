import { IsString, IsNumber, IsPositive, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductVariantFieldsDto } from './product-variant.dto';

export class UpdateProductDto extends ProductVariantFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
