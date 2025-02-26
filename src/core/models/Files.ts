import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";

@Index("idx_file_sha", ["fileSha"], { unique: true })
@Index("files_users_id_fk", ["createdBy"], {})
@Entity("files", { schema: "neodrive" })
export class Files {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  public id: string;

  @Column("varchar", { name: "file_name", length: 127 })
  public fileName: string;

  @Column("bigint", { name: "file_size", unsigned: true, default: () => "'0'" })
  public fileSize: string;

  @Column("varchar", { name: "file_sha", unique: true, length: 64 })
  public fileSha: string;

  @Column("varchar", { name: "file_path", length: 255 })
  public filePath: string;

  @Column("varchar", { name: "short_code", length: 31 })
  public shortCode: string;

  @Column("bigint", { name: "created_by", nullable: true, unsigned: true })
  public createdBy: string | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  public createdAt: Date | null;

  @Column("timestamp", { name: "updated_at", nullable: true })
  public updatedAt: Date | null;

  @ManyToOne(() => Users, (users) => users.files, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  public createdBy2: Users;
}
