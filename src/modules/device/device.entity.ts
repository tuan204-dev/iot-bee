import { Column, Entity, OneToMany } from 'typeorm';
import { SensorEntity } from '../sensor/sensor.entity';
import { ActuatorEntity } from '../actuator/actuator.entity';
import { ActionEntity } from '../action/action.entity';

@Entity('devices')
export class DeviceEntity {
  @Column({
    primary: true,
    type: 'int',
    generated: 'increment',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string;

  // Relations
  @OneToMany(() => SensorEntity, (sensor) => sensor.device)
  sensors: SensorEntity[];

  @OneToMany(() => ActuatorEntity, (actuator) => actuator.device)
  actuators: ActuatorEntity[];

  @OneToMany(() => ActionEntity, (action) => action.device)
  actions: ActionEntity[];
}
