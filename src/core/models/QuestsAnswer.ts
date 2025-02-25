import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("quests_answer", { schema: "neodrive" })
export class QuestsAnswer {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", unsigned: true })
  public id: string;

  @Column("int", { name: "question_id", nullable: true, unsigned: true })
  public questionId: number | null;

  @Column("enum", {
    name: "code_lang",
    nullable: true,
    enum: ["js", "python", "java", "c++", "go"],
  })
  public codeLang: "js" | "python" | "java" | "c++" | "go" | null;

  @Column("text", { name: "llm_res", nullable: true })
  public llmRes: string | null;

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
