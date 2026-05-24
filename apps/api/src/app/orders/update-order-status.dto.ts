import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['PENDING', 'AWAITING_CONFIRMATION', 'PAID', 'SHIPPED', 'CANCELLED'])
  status:
    | 'PENDING'
    | 'AWAITING_CONFIRMATION'
    | 'PAID'
    | 'SHIPPED'
    | 'CANCELLED';
}
