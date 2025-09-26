import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { SensorEntity } from '../sensor/sensor.entity';

@Entity('sensor_data')
export class SensorDataEntity {
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
  sensor_id: number;

  @Column({
    type: 'float',
    nullable: false,
  })
  value: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  unit: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date;

  // Relations
  @ManyToOne(() => SensorEntity, (sensor) => sensor.sensorData)
  @JoinColumn({ name: 'sensor_id' })
  sensor: SensorEntity;
}
