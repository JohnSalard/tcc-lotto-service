import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lotto-purchase' })
export class LottoPurchaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('int')
  prizeId: number;

  @Column({ nullable: true })
  oneDigit: string;

  @Column({ nullable: true })
  twoDigit: string;

  @Column({ nullable: true })
  threeDigit: string;

  @Column({ nullable: true })
  oneDigitAmount: string;

  @Column({ nullable: true })
  twoDigitAmount: string;

  @Column({ nullable: true })
  threeDigitAmount: string;

  @Column()
  userId: string;
}
