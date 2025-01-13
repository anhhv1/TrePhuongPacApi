import { Module } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { VnpayController } from './vnpay.controller';
import { VnpayModule as VnModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';

@Module({
  imports: [
    VnModule.register({
        tmnCode: '5HC24BC1',
        secureSecret: 'RTZBS7CXMEP8C6ESPB2POQLVKXOPRQIN',
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true

        /**
         * Sử dụng enableLog để bật/tắt logger
         * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
         */
        enableLog: true, // tùy chọn

        /**
         * Hàm `loggerFn` sẽ được gọi để ghi log
         * Mặc định, loggerFn sẽ ghi log ra console
         * Bạn có thể ghi đè loggerFn để ghi log ra nơi khác
         *
         * `ignoreLogger` là một hàm không làm gì cả
         */
        loggerFn: ignoreLogger, // tùy chọn
    })
  ],
  controllers: [VnpayController],
  providers: [VnpayService],
})
export class VnpayModule {}
