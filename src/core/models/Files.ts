import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("file_sha", ["fileSha"], { unique: true })
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

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  public createdAt: Date | null;

  @Column("timestamp", { name: "updated_at", nullable: true })
  public updatedAt: Date | null;
}
