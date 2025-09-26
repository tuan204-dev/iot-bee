import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { DeviceEntity } from '../device/device.entity';
import { SensorDataEntity } from '../sensor-data/sensor-data.entity';

@Entity('sensors')
export class SensorEntity {
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

  // Relations
  @ManyToOne(() => DeviceEntity, (device) => device.sensors)
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;

  @OneToMany(() => SensorDataEntity, (sensorData) => sensorData.sensor)
  sensorData: SensorDataEntity[];
}
