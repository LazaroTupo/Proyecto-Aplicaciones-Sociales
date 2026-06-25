import { Injectable } from "@nestjs/common";
import { paypal, paypalClient } from "./paypal.client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PaypalService {

  constructor(
    private prisma: PrismaService,
  ) { }

  async createOrder(
    amount: number,
    projectId: number,
    userId: number,
    tierId?: number,
  ) {
    const request =
      new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toString(),
          },
          custom_id: JSON.stringify({
            projectId,
            userId,
            tierId,
          }),
        },
      ],
    });

    const response =
      await paypalClient.execute(request);

    return {
      orderId: response.result.id,
    };
  }

  async captureOrder(
    orderId: string,
    projectId: number,
    userId: number,
    amount: number,
    tierId?: number,
  ) {

    const request =
      new paypal.orders.OrdersCaptureRequest(orderId);

    const response =
      await paypalClient.execute(request);

    const capture =
      response.result.purchase_units[0]
        .payments.captures[0];

    await this.prisma.contribution.create({
      data: {
        amount: Number(amount),
        projectId: Number(projectId),
        userId,
        tierId: tierId ?? null,
        paypalId: capture.id,
      },
    });

    return { success: true };
  }
}