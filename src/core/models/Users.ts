import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ShortendLink } from "./ShortendLink";
import { Files } from "./Files";

@Entity("users", { schema: "neodrive" })
export class Users {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  public id: string;

  @Column("varchar", { name: "email", length: 63 })
  public email: string;

  @Column("varchar", { name: "name", nullable: true, length: 63 })
  public name: string | null;

  @Column("varchar", { name: "username", length: 31 })
  public username: string;

  @Column("varchar", { name: "password", length: 127 })
  public password: string;

  @Column("tinyint", {
    name: "is_verified",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  public isVerified: boolean | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  public createdAt: Date | null;

  @Column("timestamp", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  public updatedAt: Date | null;

  @OneToMany(() => ShortendLink, (shortendLink) => shortendLink.createdBy2)
  public shortendLinks: ShortendLink[];

  @OneToMany(() => Files, (files) => files.createdBy2)
  public files: Files[];
}
