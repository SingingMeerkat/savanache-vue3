import { PangenomeJson } from "@/interfaces/pangenome-json";
import { PivotJson } from "@/interfaces/pivot-json";

let dataCache: undefined | { pangenome: PangenomeJson; pivots: PivotJson };

export const getData = async () => {
  if (dataCache) {
    return dataCache;
  }
  const pangenomeImport = await import(
    "../data/sample/handcrafted3AssembliesPangenome.json"
    );

  const pivotsImport = await import("../data/sample/pivots.json");

  if (pangenomeImport && pangenomeImport.default && pivotsImport && pivotsImport.default) {
    dataCache = { pangenome: pangenomeImport.default, pivots: pivotsImport.default };

    return dataCache;
  }
};
