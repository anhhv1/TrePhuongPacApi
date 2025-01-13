import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import * as dateFormat from 'dateformat';

@Injectable()
export class VnpayService {
  private vnp_TmnCode = 'AW624W9P';
  private vnp_HashSecret = 'DU7ZTMH6MATAIAM1T9ZGTKD36QDTB2Q6';
  private vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private vnp_ReturnUrl = 'http://localhost:3000/payment-return';

  createPaymentUrl(orderInfo: string, amount: number, bankCode?: string): any {
    const date = new Date();
    
    const createDate = dateFormat(date, 'yyyymmddHHmmss');
    const orderId = dateFormat(date, 'HHmmss');
    
    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'billpayment',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: `${this.vnp_ReturnUrl}/${orderInfo}`,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    console.log(vnp_Params);
    return
    
    // Add bank code if provided
    if (bankCode && bankCode.length > 0) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sort parameters before signing
    const sortedParams = this.sortObject(vnp_Params);
    
    // Create the signing data
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    // Create SHA512 hash
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Add secure hash to parameters
    vnp_Params['vnp_SecureHash'] = signed;
    
    // Build final URL
    const finalUrl = `${this.vnp_Url}?${querystring.stringify(vnp_Params, { encode: false })}`;

    return {
      code: '00',
      content: finalUrl,
    };
  }

  private sortObject(obj: object) {
    const sorted = {};
    const str = [];
    let key;
    
    // Get all keys and sort them
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    
    // Create new object with sorted keys
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}