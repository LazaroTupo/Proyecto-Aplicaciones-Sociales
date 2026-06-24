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
  ) {}

  @Post("create-paypal-order")
  async createOrder() {
    return this.paypalService.createOrder();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post("capture-paypal-order")
  async captureOrder(
    @Body() body: { orderId: string, projectId: number },
    @Req() req: any
  ) {

    const userId = req.user.id;

    return this.paypalService.captureOrder(
      body.orderId,
      body.projectId,
      userId
    );
  }
}