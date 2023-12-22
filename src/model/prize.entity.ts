import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'prizes' })
export class PrizeEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  oneDigit: string;

  @Column()
  twoDigit: string;

  @Column()
  threeDigit: string;

  @Column()
  label: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
