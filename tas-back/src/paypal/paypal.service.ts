import { Injectable } from "@nestjs/common";
import { paypal, paypalClient } from "./paypal.client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PaypalService {
  
  constructor(
    private prisma: PrismaService,
  ) { }

  async createOrder() {

    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");

    request.requestBody({
      intent: "CAPTURE",

      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "10.00",
          },
        },
      ],
    });

    const response = await paypalClient.execute(request);

    return {
      orderId: response.result.id,
    };
  }

  async captureOrder(orderId: string, projectId: number, userId: number) {

    const request =
      new paypal.orders.OrdersCaptureRequest(orderId);

    request.requestBody({});

    const response = await paypalClient.execute(request);

    const capture =
      response.result.purchase_units[0]
        .payments.captures[0];

    const amount = Number(capture.amount.value);

    const transactionId = capture.id;

    await this.prisma.contribution.create({
      data: {
        amount,
        projectId: Number(projectId),
        userId
      }
    })

    return {
      success: true,
      amount,
      transactionId,
    };
  }
}