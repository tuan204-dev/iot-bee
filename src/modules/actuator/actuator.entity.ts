import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { DeviceEntity } from '../device/device.entity';

@Entity('actuators')
export class ActuatorEntity {
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
  device_id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  state: string;

  // Relations
  @ManyToOne(() => DeviceEntity, (device) => device.actuators)
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;

  @OneToMany('ActionHistoryEntity', 'actuator')
  actionHistories: any[];
}
