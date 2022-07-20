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

  let lastPivotStep;
  let lastPresentPivotStep;

  Object.entries(pangenomeImport.paths).forEach(([pivotPathName, pivotPathData]) => {
    Object.entries(pangenomeImport.paths).forEach(([comparePathName, comparePathData]) => {
      if (pivotPathName === comparePathName) {
        return;
      }
      const pivotName = `${pivotPathName}#${comparePathName}`;
      if (!pivotsImport[pivotName]) {
        pivotsImport[pivotName] = [];
      }
      const pivot = pivotsImport[pivotName];
      for (let pivotPathStepsIndex = 0; pivotPathStepsIndex < pivotPathData.steps.length; pivotPathStepsIndex++) {

        const pivotPathStep = pivotPathData.steps[pivotPathStepsIndex];
        const pivotPathStepSkeletonBlock = pangenomeImport.panSkeleton[pivotPathStep.panBlock];
        // if (!pivot[pivotPathStep.panBlock]) {
        //   pivot[pivotPathStep.panBlock] = { panBlock: pivotPathStep.panBlock };
        // }
        const pivotStep = {
          // pivotPathName,
          // comparePathName,
          panBlock: pivotPathStep.panBlock,
          pivotStepIndex: pivotPathStepsIndex,
        }; // pivot[pivotPathStep.panBlock];
        pivot.push(pivotStep);

        for (let comparePathStepsIndex = 0; comparePathStepsIndex < comparePathData.steps.length; comparePathStepsIndex++) {

          const comparePathStep = comparePathData.steps[comparePathStepsIndex];
          const comparePathStepSkeletonBlock = pangenomeImport.panSkeleton[comparePathStep.panBlock];

          if (pivotPathStepSkeletonBlock.dupes.includes(comparePathStep.panBlock)) {
            if (!pivotStep.dupes) {
              pivotStep.dupes = [];
            }
            const dupe = {
              // pivotPathName,
              // comparePathName,
              pivotStepIndex: pivotPathStepsIndex,
              compareStepIndex: comparePathStepsIndex,
              // pivotStepPanBlock: pivotPathStep.panBlock,
              compareStepPanBlock: comparePathStep.panBlock
            };
            pivotStep.dupes.push(dupe);
          }

          if (pivotPathStep.panBlock === comparePathStep.panBlock) {
            pivotStep.present = true;
            // pivotStep.pivotStepIndex = pivotPathStepsIndex;
            pivotStep.compareStepIndex = comparePathStepsIndex;
            if (pivotPathStep.strand !== comparePathStep.strand) {
              pivotStep.inversion = true;
            }

            if (lastPivotStep) {
              if (lastPivotStep.pivotStepIndex < pivotStep.pivotStepIndex - 1 && lastPivotStep.compareStepIndex < pivotStep.compareStepIndex - 1) {
                pivotStep.swap = true;
                // debugger;
              } else if (lastPivotStep.pivotStepIndex < pivotStep.pivotStepIndex - 1) {
                pivotStep.deletion = true;
                // debugger;
              } else if (lastPivotStep.compareStepIndex < pivotStep.compareStepIndex - 1) {

                pivotStep.insertion = true;
                pivotStep.insertionNodes = [];

                for (let insertionPathStepsIndex = lastPivotStep.compareStepIndex + 1; insertionPathStepsIndex < pivotStep.compareStepIndex; insertionPathStepsIndex++) {
                  const insertionPathStep = comparePathData.steps[insertionPathStepsIndex];
                  const insertionPathStepSkeletonBlock = pangenomeImport.panSkeleton[insertionPathStep.panBlock];

                  const insertion = {
                    // pivotPathName,
                    // comparePathName,
                    // pivotStepIndex: pivotPathStepsIndex,
                    compareStepIndex: insertionPathStepsIndex,
                    // pivotStepPanBlock: pivotPathStep.panBlock,
                    compareStepPanBlock: insertionPathStep.panBlock
                  };
                  pivotStep.insertionNodes.push(insertion);
                }
                // debugger;
              }
              if (lastPivotStep.compareStepIndex === pivotStep.compareStepIndex + 1) {

                const inversionChainNodes = lastPivotStep.inversionChainNodes || [];
                lastPivotStep.inversionChainNodes = inversionChainNodes;
                pivotStep.inversionChainNodes = inversionChainNodes;

                pivotStep.inversionChain = true;

                if (pivotStep.inversionChain && !lastPivotStep.inversionChain) {
                  lastPivotStep.inversionChain = true;
                  const inversionChain = {
                    // pivotPathName,
                    // comparePathName,
                    pivotStepIndex: lastPivotStep.pivotStepIndex,
                    compareStepIndex: lastPivotStep.compareStepIndex,
                    pivotStepPanBlock: lastPivotStep.panBlock,
                    compareStepPanBlock: lastPivotStep.panBlock,
                  };
                  inversionChainNodes.push(inversionChain);
                } else {
                  lastPivotStep.inversionChain = true;
                }

                const inversionChain = {
                  // pivotPathName,
                  // comparePathName,
                  pivotStepIndex: pivotPathStepsIndex,
                  compareStepIndex: comparePathStepsIndex,
                  pivotStepPanBlock: pivotPathStep.panBlock,
                  compareStepPanBlock: comparePathStep.panBlock
                };
                inversionChainNodes.push(inversionChain);

              }
              if (lastPivotStep.inversionChain && !pivotStep.inversionChain) {
                lastPivotStep.inversionChain = true;
              }
            }

            // if (lastPresentPivotStep) {
            //   if (lastPresentPivotStep.pivotStepIndex < pivotStep.pivotStepIndex - 1 && lastPresentPivotStep.compareStepIndex < pivotStep.compareStepIndex - 1) {
            //     pivotStep.swap = true;
            //     // debugger;
            //   } else if (lastPresentPivotStep.pivotStepIndex < pivotStep.pivotStepIndex - 1) {
            //     pivotStep.deletion = true;
            //     // debugger;
            //   } else if (lastPresentPivotStep.compareStepIndex < pivotStep.compareStepIndex - 1) {
            //     pivotStep.insertion = true;
            //     // debugger;
            //   }
            // }
          }

        }

        lastPivotStep = pivotStep;
        if (pivotStep.present) {
          lastPresentPivotStep = pivotStep;
        }
      }
    });
  });
  console.log(pivotsImport);
  // console.log(JSON.stringify(pivotsImport));
  debugger;

  console.log("pivotsImport.default", pivotsImport.default);

  Object.entries(pivotsImport.default).forEach(([pivotName, pivot]) => {
    // console.log('pivotName', pivotName, 'pivot', pivot);
    Object.entries(pivot).forEach(([pivotNodeName, pivotNode]) => {
      // console.log('pivotName', pivotName, 'pivot', pivot, 'pivotNodeName', pivotNodeName, 'pivotNode', pivotNode);
      Object.entries(pivotNode).forEach(([pivotNodeComparisonPathName, pivotNodeComparisonPath]) => {
        const pathComparisonProps = Object.entries(pivotNodeComparisonPath);
        console.log("pivotName", pivotName, "pivot", pivot, "pivotNodeName", pivotNodeName, "pivotNode", pivotNode, "pivotNodeComparisonPathName", pivotNodeComparisonPathName, "pivotNodeComparisonPath", pivotNodeComparisonPath, "pathComparisonProps", pathComparisonProps);
        pivotNodeComparisonPath.variationLength = 0;
        if (pathComparisonProps.length > 1 || !pivotNodeComparisonPath.present) {
          pivotNodeComparisonPath.variationLength = pangenomeImport.panSkeleton[pivotNodeName].length;
          if (!pivotNodeComparisonPath.nodes || !pivotNodeComparisonPath.nodes.length) {
            pivotNodeComparisonPath.variationLength = pangenomeImport.panSkeleton[pivotNodeName].length;
          } else {
            let pathVariationFromPivot = 0;
            pivotNodeComparisonPath.nodes.forEach(nodeName => {
              pathVariationFromPivot += pangenomeImport.panSkeleton[nodeName].length;
            });
            pivotNodeComparisonPath.pathVariationFromPivot = pathVariationFromPivot;

            let pivotVariationFromPath = 0;
            const pivot2 = pivotsImport.default[pivotName];
            Object.entries(pivot2).forEach(([pivotNodeName2, pivotNode2]) => {
              const pivotNodeComparisonPath2 = pivotNode2[pivotNodeComparisonPathName];
              if (pivotNodeComparisonPath2.nodes && pivotNodeComparisonPath2.nodes.find(nodeName => pivotNodeComparisonPath.nodes.includes(nodeName))) {
                pivotVariationFromPath += pangenomeImport.panSkeleton[pivotNodeName2].length;
              }
            });
            pivotNodeComparisonPath.pivotVariationFromPath = pivotVariationFromPath;

            pivotNodeComparisonPath.variationLength = Math.max(pivotNodeComparisonPath.pathVariationFromPivot, pivotNodeComparisonPath.pivotVariationFromPath);
            // debugger;
            // const pivotNode2 = pivot2[pivotNodeName];
            // const pivotNodeComparisonPath2 = pivotNode2[pivotNodeComparisonPathName];
            // debugger;


            //
            // Object.entries(pivot).forEach(([pivotNodeName2, pivotNode2]) => {
            //
            //   debugger;
            //   if (pivotNodeComparisonPath2.nodes && pivotNodeComparisonPath2.nodes.includes(pivotNodeName)) {
            //     debugger;
            //     pivotVariationFromPath += pangenomeImport.panSkeleton[pivotNodeName2].length;
            //   }
            // });
          }
          // pivotNodeComparisonPath.variationLength = Math.max(pivotNodeComparisonPath.variationLength, pangenomeImport.panSkeleton[pivotNodeName].length);
        }
        console.log("pivotNodeComparisonPath.variationLength", pivotNodeComparisonPath.variationLength);

      });
    });
  });

  if (pangenomeImport && pangenomeImport.default && pivotsImport && pivotsImport.default) {
    dataCache = { pangenome: pangenomeImport.default, pivots: pivotsImport.default };

    return dataCache;
  }
};