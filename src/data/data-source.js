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
        console.log('pivotName', pivotName, 'pivot', pivot, 'pivotNodeName', pivotNodeName, 'pivotNode', pivotNode, 'pivotNodeComparisonPathName', pivotNodeComparisonPathName, 'pivotNodeComparisonPath', pivotNodeComparisonPath, 'pathComparisonProps', pathComparisonProps);
        pivotNodeComparisonPath.variationLength = 0;
        if (pathComparisonProps.length > 1 || !pivotNodeComparisonPath.Present) {
          pivotNodeComparisonPath.variationLength = pangenomeImport.panSkeleton[pivotNodeName].length;
          if (!pivotNodeComparisonPath.Nodes || !pivotNodeComparisonPath.Nodes.length) {
            pivotNodeComparisonPath.variationLength = pangenomeImport.panSkeleton[pivotNodeName].length;
          } else {
            let pathVariationFromPivot = 0;
            pivotNodeComparisonPath.Nodes.forEach(nodeName => {
              pathVariationFromPivot += pangenomeImport.panSkeleton[nodeName].length;
            });
            pivotNodeComparisonPath.pathVariationFromPivot = pathVariationFromPivot;

            let pivotVariationFromPath = 0;
            const pivot2 = pivotsImport.default[pivotName];
            Object.entries(pivot2).forEach(([pivotNodeName2, pivotNode2]) => {
              const pivotNodeComparisonPath2 = pivotNode2[pivotNodeComparisonPathName];
              if (pivotNodeComparisonPath2.Nodes && pivotNodeComparisonPath2.Nodes.find(nodeName => pivotNodeComparisonPath.Nodes.includes(nodeName))) {
                pivotVariationFromPath += pangenomeImport.panSkeleton[pivotNodeName2].length;
              }
            });
            pivotNodeComparisonPath.pivotVariationFromPath = pivotVariationFromPath;

            pivotNodeComparisonPath.variationLength = Math.max(pivotNodeComparisonPath.pathVariationFromPivot, pivotNodeComparisonPath.pivotVariationFromPath)
            // debugger;
            // const pivotNode2 = pivot2[pivotNodeName];
            // const pivotNodeComparisonPath2 = pivotNode2[pivotNodeComparisonPathName];
            // debugger;


            //
            // Object.entries(pivot).forEach(([pivotNodeName2, pivotNode2]) => {
            //
            //   debugger;
            //   if (pivotNodeComparisonPath2.Nodes && pivotNodeComparisonPath2.Nodes.includes(pivotNodeName)) {
            //     debugger;
            //     pivotVariationFromPath += pangenomeImport.panSkeleton[pivotNodeName2].length;
            //   }
            // });
          }
          // pivotNodeComparisonPath.variationLength = Math.max(pivotNodeComparisonPath.variationLength, pangenomeImport.panSkeleton[pivotNodeName].length);
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