import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity('action_histories')
export class ActionHistoryEntity {
  @Column({
    primary: true,
    type: 'int',
    generated: 'increment',
  })
  id: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  action_id: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  actuator_id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  status: string;

  // Relations
  @ManyToOne('ActionEntity', 'actionHistories')
  @JoinColumn({ name: 'action_id' })
  action: any;

  @ManyToOne('ActuatorEntity', 'actionHistories')
  @JoinColumn({ name: 'actuator_id' })
  actuator: any;
}
