import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Observable } from 'rxjs';

@Injectable()
export class VnpayService {
  private vnp_TmnCode = 'AW624W9P'; // Mã website tại VNPAY
  private vnp_HashSecret = 'DU7ZTMH6MATAIAM1T9ZGTKD36QDTB2Q6'; // Chuỗi bí mật
  private vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'; // URL sandbox của VNPay

  createPaymentUrl(orderInfo: string, amount: number): any {
    console.log(orderInfo)

    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: `${Date.now()}`,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'billpayment',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: `http://localhost:3000/payment-return/${orderInfo}`, // URL sau khi thanh toán thành công
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14),
    };
    const sortedParams = Object.keys(vnp_Params).sort().reduce((acc, key) => {
      acc[key] = vnp_Params[key];
      return acc;
    }, {});
    const queryString = new URLSearchParams(sortedParams as any).toString();
    const secureHash = crypto.createHmac('sha512', this.vnp_HashSecret)
      .update(queryString)
      .digest('hex');
    return {
      content: `${this.vnp_Url}?${queryString}&vnp_SecureHash=${secureHash}`,
    };
  }
}
