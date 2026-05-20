import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './checkout.dto';
import { UpdateOrderStatusDto } from './update-order-status.dto';
import { AdminBroadcastDto } from './admin-broadcast.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly realtime: RealtimeGateway,
  ) {}

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'))
  checkout(@Req() req: { user: { id: number } }, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.id, dto);
  }

  @Post('admin/broadcast')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  adminBroadcast(@Body() dto: AdminBroadcastDto) {
    this.realtime.emitAdminNotification(dto.message, dto.audience ?? 'admin');
    return { ok: true };
  }

  @Get('admin/recent')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  adminRecent() {
    return this.ordersService.findRecentForAdmin();
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatusByAdmin(id, dto.status);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findMine(@Req() req: { user: { id: number } }) {
    return this.ordersService.findManyForUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOneForUser(req.user.id, id);
  }
}
