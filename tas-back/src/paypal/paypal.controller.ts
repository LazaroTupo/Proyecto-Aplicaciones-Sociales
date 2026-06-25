import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { PaypalService } from "./paypal.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("payments")
export class PaypalController {

  constructor(
    private readonly paypalService: PaypalService,
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post("create-paypal-order")
  async createOrder(
    @Body() body: {
      amount: number;
      projectId: number;
      tierId?: number;
    },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.paypalService.createOrder(
      body.amount,
      body.projectId,
      userId,
      body.tierId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post("capture-paypal-order")
  async captureOrder(
    @Body()
    body: {
      orderId: string;
      projectId: number;
      amount: number;
      tierId?: number;
    },
    @Req() req: any,
  ) {

    const userId = req.user.id;

    return this.paypalService.captureOrder(
      body.orderId,
      body.projectId,
      userId,
      body.amount,
      body.tierId,
    );
  }
}