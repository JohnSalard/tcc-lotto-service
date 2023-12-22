import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrizeEntity } from './model/prize.entity';
import { LottoPurchaseEntity } from './model/lotto-purchase.entity';
import { RedisService } from './modules/redis/redis.service';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(PrizeEntity)
    private readonly prizeRepo: Repository<PrizeEntity>,
    @InjectRepository(LottoPurchaseEntity)
    private readonly lottoPurchaseRepo: Repository<LottoPurchaseEntity>,
    @Inject(RedisService)
    private redisService: RedisService,
  ) {}

  async getRewardHistory(): Promise<any> {
    const query = this.prizeRepo
      .createQueryBuilder('prize')
      .select(['prize.id', 'prize.oneDigit', 'prize.twoDigit', 'prize.threeDigit', 'prize.label'])
      .orderBy('prize.createdAt', 'DESC')
      .limit(6);

    const result = await query.getMany();
    //remove top 1
    result.shift();

    return result;
  }

  async generate(): Promise<any> {
    let oneDigit = Math.floor(Math.random() * 10);
    let oneDigitStr = oneDigit.toString();
    let twoDigit = Math.floor(Math.random() * 100);
    let twoDigitStr = twoDigit.toString();
    let threeDigit = Math.floor(Math.random() * 1000);
    let threeDigitStr = threeDigit.toString();
    if (twoDigit < 10) {
      twoDigitStr = '0' + twoDigitStr;
    }

    if (threeDigit < 10) {
      threeDigitStr = '00' + threeDigitStr;
    } else if (threeDigit < 100) {
      threeDigitStr = '0' + threeDigitStr;
    }

    const label = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }).replace(',', '').slice(0, 16);

    let latestPrize = await this.prizeRepo.createQueryBuilder('prize').orderBy('prize.createdAt', 'DESC').limit(1).getOne();
    if (latestPrize) {
      latestPrize.oneDigit = oneDigitStr;
      latestPrize.twoDigit = twoDigitStr;
      latestPrize.threeDigit = threeDigitStr;
      latestPrize.label = label;
      await this.prizeRepo.save(latestPrize);
    } else {
      latestPrize = await this.prizeRepo.save({
        oneDigit: oneDigitStr,
        twoDigit: twoDigitStr,
        threeDigit: threeDigitStr,
        label,
      });
    }

    // handle reward
    const userPurchases = await this.lottoPurchaseRepo.find({
      where: {
        prizeId: latestPrize.id,
      },
    });

    // calculate reward
    const summary = [];
    for (const item of userPurchases) {
      let reward = 0;
      if (item.oneDigit === oneDigitStr) {
        reward += 8 * parseInt(item.oneDigitAmount);
      }

      if (item.twoDigit === twoDigitStr) {
        reward += 80 * parseInt(item.twoDigitAmount);
      }

      if (item.threeDigit === threeDigitStr) {
        reward += 800 * parseInt(item.threeDigitAmount);
      }

      if (reward > 0) {
        summary.push({
          userId: item.userId,
          amount: reward,
        });
      }
    }

    console.log('summary: ', summary);

    // create empty prize for next id
    await this.prizeRepo.save({
      oneDigit: '',
      twoDigit: '',
      threeDigit: '',
      label: '',
    });

    // publish to redis
    if (summary.length > 0) {
      await this.redisService.publish('lotto_reward', JSON.stringify({ data: summary }));
    }

    return;
  }

  async purchase(payload: any): Promise<any> {
    let latestPrize = await this.prizeRepo.createQueryBuilder('prize').orderBy('prize.createdAt', 'DESC').limit(1).getOne();
    let latestPrizeId = latestPrize ? latestPrize.id : 1;

    console.log('payload.userId: ', payload.userId);

    const data = await this.lottoPurchaseRepo.findOne({
      where: {
        userId: payload.userId,
        prizeId: latestPrizeId,
      },
    });

    let amount = 0;
    if (!data) {
      await this.lottoPurchaseRepo.save({
        prizeId: latestPrizeId,
        oneDigit: payload.oneDigit,
        twoDigit: payload.twoDigit,
        threeDigit: payload.threeDigit,
        oneDigitAmount: payload.oneDigitAmount,
        twoDigitAmount: payload.twoDigitAmount,
        threeDigitAmount: payload.threeDigitAmount,
        userId: payload.userId,
      });
      amount = parseInt(payload.oneDigitAmount || 0) + parseInt(payload.twoDigitAmount || 0) + parseInt(payload.threeDigitAmount || 0);
    } else {
      if (payload.oneDigit) {
        data.oneDigit = payload.oneDigit;
        data.oneDigitAmount = payload.oneDigitAmount;
        amount += parseInt(payload.oneDigitAmount);
      } else if (payload.twoDigit) {
        data.twoDigit = payload.twoDigit;
        data.twoDigitAmount = payload.twoDigitAmount;
        amount += parseInt(payload.twoDigitAmount);
      } else if (payload.threeDigit) {
        data.threeDigit = payload.threeDigit;
        data.threeDigitAmount = payload.threeDigitAmount;
        amount += parseInt(payload.threeDigitAmount);
      }
      await this.lottoPurchaseRepo.save(data);
    }

    await this.redisService.publish('lotto_purchase', JSON.stringify({ data: [{ userId: payload.userId, amount }] }));

    return;
  }

  async getPurchaseHistory(userId: string): Promise<any> {
    const data = await this.lottoPurchaseRepo.find({
      where: {
        userId,
      },
      order: {
        prizeId: 'DESC',
      },
    });

    return data;
  }
}
