import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false,
        unique: true
    })
    email: string

    @Column({
        type: 'varchar',
        length: 60,
        nullable: false
    })
    password: string

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false
    })
    name: string

    @Column({ type:'int', default: 0 })
    points: number
}
