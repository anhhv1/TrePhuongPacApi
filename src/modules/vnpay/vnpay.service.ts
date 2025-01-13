import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import { VnpayService as vnService } from 'nestjs-vnpay';
import { Bank } from 'vnpay';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

@Injectable()
export class VnpayService {
  private vnp_TmnCode = '5HC24BC1';
  private vnp_HashSecret = '30YVAEB1W03RFU8U15JI9GCOO8S50G62';
  private vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private vnp_ReturnUrl = 'http://localhost:3000/payment-return';

  constructor(private readonly vnpayService: vnService) {}

  createPaymentUrl(orderInfo: string, amount: number, bankCode?: string): any {
    const date = new Date();
    
    const createDate = formatDate(date);
 
    
    const orderId = formatDate(date);
    
    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount,
      vnp_ReturnUrl: `${this.vnp_ReturnUrl}/${orderInfo}`,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };

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

  async getBankList() {
    const bankList: Bank[] = await this.vnpayService.getBankList();
    console.log("123123213",bankList);
    
    return bankList
  }
}