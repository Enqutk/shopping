import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'])
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
}
