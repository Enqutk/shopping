import { IsString, IsNumber, IsPositive, IsOptional, IsInt, Min, MaxLength, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductVariantFieldsDto } from './product-variant.dto';

export class CreateProductDto extends ProductVariantFieldsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

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
