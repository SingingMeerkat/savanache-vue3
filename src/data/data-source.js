let dataCache;
let promise;

export const getData = () => {
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      getDataInternal().then(resolve).catch(reject);
    });
  }
  return promise;
};


const getDataInternal = async () => {
  if (dataCache) {
    return dataCache;
  }
  const pangenomeImport = await import(
    "../data/sample/handcrafted3AssembliesPangenome.json"
    );

  const pivotsImport = await import("../data/sample/pivots.json");

  // debugger;

  console.log('pivotsImport.default', pivotsImport.default);

  Object.entries(pivotsImport.default).forEach(([pivotName, pivot]) => {
    // console.log('pivotName', pivotName, 'pivot', pivot);
    Object.entries(pivot).forEach(([pivotNodeName, pivotNode]) => {
      // console.log('pivotName', pivotName, 'pivot', pivot, 'pivotNodeName', pivotNodeName, 'pivotNode', pivotNode);
      Object.entries(pivotNode).forEach(([pivotNodeComparisonPathName, pivotNodeComparisonPath]) => {
        const pathComparisonProps = Object.entries(pivotNodeComparisonPath);
        console.log('pivotName', pivotName, 'pivotNodeName', pivotNodeName, 'pivotNodeComparisonPathName', pivotNodeComparisonPathName, 'pathComparisonProps', JSON.stringify(pathComparisonProps));
        pivotNodeComparisonPath.variationLength = 0;
        if (pathComparisonProps.length > 1 || !pivotNodeComparisonPath.Present) {
          if (!pivotNodeComparisonPath.Nodes || !pivotNodeComparisonPath.Nodes.length) {
            pivotNodeComparisonPath.variationLength = pangenomeImport.panSkeleton[pivotNodeName].length;
          } else {
            pivotNodeComparisonPath.Nodes.forEach(nodeName => {
              pivotNodeComparisonPath.variationLength += pangenomeImport.panSkeleton[nodeName].length;
            });
            // pivotNodeComparisonPath.variationLength = Math.max(pivotNodeComparisonPath.variationLength, pangenomeImport.panSkeleton[pivotNodeName].length);
          }
        }
        console.log('pivotNodeComparisonPath.variationLength', pivotNodeComparisonPath.variationLength);

      });
    });
  });

  if (pangenomeImport && pangenomeImport.default && pivotsImport && pivotsImport.default) {
    dataCache = { pangenome: pangenomeImport.default, pivots: pivotsImport.default };

    return dataCache;
  }
}