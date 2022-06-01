import { Path, Paths } from "@/interfaces/pangenome-json";

export interface PathRow {
  name: keyof Paths<Path>;
  steps: number;
}
