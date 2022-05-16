import { PangenomeJson } from "@/interfaces/pangenome-json";
import { PivotJson } from "@/interfaces/pivot-json";

let dataCache: undefined | { pangenome: PangenomeJson; pivots: PivotJson };

export const getData = async () => {
  if (dataCache) {
    return dataCache;
  }
  const { default: pangenome } = (await import(
    "../data/sample/handcrafted3AssembliesPangenome.json"
    )) as { default: PangenomeJson };
  const { default: pivots } = (await import("../data/sample/pivots.json")) as {
    default: PivotJson;
  };

  if (pangenome && pivots) {
    dataCache = { pangenome, pivots };
    return dataCache;
  }
};
