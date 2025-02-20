import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("short_code", ["shortCode"], { unique: true })
@Entity("shortend_link", { schema: "neodrive" })
export class ShortendLink {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  public id: string;

  @Column("varchar", { name: "original_url", length: 255 })
  public originalUrl: string;

  @Column("varchar", { name: "short_code", unique: true, length: 20 })
  public shortCode: string;

  @Column("int", { name: "access_count", nullable: true, default: () => "'0'" })
  public accessCount: number | null;

  @Column("int", { name: "created_by", nullable: true, unsigned: true })
  public createdBy: number | null;

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
}
