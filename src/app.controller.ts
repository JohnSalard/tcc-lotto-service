import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/lotto')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/reward-history')
  getRewardHistory(): any {
    return this.appService.getRewardHistory();
  }

  @Post('/generate')
  generate(): any {
    return this.appService.generate();
  }

  @Post('/purchase')
  purchase(@Body() payload: any): any {
    return this.appService.purchase(payload);
  }

  @Get('/purchase-history/:userId')
  getPurchaseHistory(@Param('userId') userId: string): any {
    return this.appService.getPurchaseHistory(userId);
  }
}
