import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminBroadcastDto {
  @IsString()
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsIn(['admin', 'all'])
  audience?: 'admin' | 'all';
}
