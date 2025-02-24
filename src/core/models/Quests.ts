import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("title_slug", ["titleSlug"], { unique: true })
@Entity("quests", { schema: "neodrive" })
export class Quests {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  public id: string;

  @Column("varchar", { name: "title_slug", unique: true, length: 255 })
  public titleSlug: string;

  @Column("int", { name: "question_id", nullable: true, unsigned: true })
  public questionId: number | null;

  @Column("enum", {
    name: "difficulty",
    nullable: true,
    enum: ["easy", "medium", "hard"],
  })
  public difficulty: "easy" | "medium" | "hard" | null;

  @Column("varchar", { name: "question_title", nullable: true, length: 255 })
  public questionTitle: string | null;

  @Column("text", { name: "content", nullable: true })
  public content: string | null;

  @Column("text", { name: "cleaned_content", nullable: true })
  public cleanedContent: string | null;

  @Column("varchar", { name: "category_title", nullable: true, length: 31 })
  public categoryTitle: string | null;

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
