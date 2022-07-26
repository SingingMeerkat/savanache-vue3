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


const enumeratePangenomePathsOuterLoop = ({
                                            pangenomeImport,
                                            // pivotsImport,
                                            pivotPathName,
                                            pivotPathData
                                          }) => {

  const pivots = {};

  Object.entries(pangenomeImport.paths).forEach(([comparisonPathName, comparisonPathData]) => {
    const innerLoopResult = enumeratePangenomePathsInnerLoop({
      pangenomeImport,
      // pivotsImport,
      pivotPathName,
      pivotPathData,
      comparisonPathName,
      comparisonPathData
    });
    if (innerLoopResult && innerLoopResult.pivot) {
      // const pivotName = `${pivotPathName}#${comparisonPathName}`;
      if (!pivots[pivotPathName]) {
        pivots[pivotPathName] = {};
      }
      if (!pivots[pivotPathName][comparisonPathName]) {
        pivots[pivotPathName][comparisonPathName] = {};
      }
      Object.assign(pivots[pivotPathName][comparisonPathName], innerLoopResult.pivot);

      let trackMissingComparisonSteps = [];
      let lastPresentStepBeforeMissing;
      let firstPresentStepAfterMissing;

      innerLoopResult.pivot.array.forEach((pivotStep) => {
        if (pivotStep.comparisonStepIndex !== undefined) {
          if (trackMissingComparisonSteps.length === 0) {
            lastPresentStepBeforeMissing = pivotStep;
          } else {
            firstPresentStepAfterMissing = pivotStep;
            if (!lastPresentStepBeforeMissing) {
              // Do nothing, this is dangling at the front of the path
              // debugger;
              lastPresentStepBeforeMissing = pivotStep
              firstPresentStepAfterMissing = null;
              trackMissingComparisonSteps = [];
            } else {
              let highestIndexBeforeGap = lastPresentStepBeforeMissing.comparisonStepIndex;
              let lowestIndexAfterGap = firstPresentStepAfterMissing.comparisonStepIndex;
              // Account for inversion chains...
              if (lastPresentStepBeforeMissing.inversionChain) {
                // Inversion Chain before Swap or Deletion
                lastPresentStepBeforeMissing.inversionChainNodes.forEach(node => highestIndexBeforeGap = Math.max(highestIndexBeforeGap, node.comparisonStepIndex));
                // debugger;
              }
              if (firstPresentStepAfterMissing.inversionChain) {
                // Inversion Chain after Swap or Deletion
                firstPresentStepAfterMissing.inversionChainNodes.forEach(node => lowestIndexAfterGap = Math.min(lowestIndexAfterGap, node.comparisonStepIndex));
                // debugger;
              }
              if (highestIndexBeforeGap === lowestIndexAfterGap - 1) {
                // Deletion
                const swapOrDelete = trackMissingComparisonSteps[0].swapOrDelete;
                const swapOrDeleteNodes = trackMissingComparisonSteps[0].swapOrDeleteNodes;
                if (swapOrDelete && swapOrDeleteNodes) {
                  // Deletion not detected on initial pass
                  trackMissingComparisonSteps.forEach((missingStep) => {
                    missingStep.deleted = missingStep.swapOrDelete || true;
                    missingStep.deletedNodes = missingStep.swapOrDeleteNodes || swapOrDeleteNodes;

                    // TODO: Fill in missing nodes from nodes between the start and end

                    if (missingStep.deletedNodes && !missingStep.deletedNodes.find(node => node.pivotStepIndex === missingStep.pivotStepIndex)) {
                      const deletedNode = {
                        pivotStepIndex: missingStep.pivotStepIndex,
                        pivotStepPanBlock: missingStep.panBlock,
                      };
                      missingStep.deletedNodes.push(deletedNode);
                      missingStep.deletedNodes.sort((a, b) => a.pivotStepIndex - b.pivotStepIndex);
                      // debugger;
                    }

                    delete missingStep.swapOrDelete;
                    delete missingStep.swapOrDeleteNodes;

                    // debugger;

                  });
                  // debugger;
                  lastPresentStepBeforeMissing = pivotStep
                  firstPresentStepAfterMissing = null;
                  trackMissingComparisonSteps = [];

                } else {
                  // Deletion detected on initial pass
                  // debugger;
                  lastPresentStepBeforeMissing = pivotStep
                  firstPresentStepAfterMissing = null;
                  trackMissingComparisonSteps = [];
                }
              } else {
                // Swap?
                if (trackMissingComparisonSteps[0].swapOrDelete && trackMissingComparisonSteps[0].swapOrDeleteNodes) {
                  // Swap not detected on initial pass
                  const swapOrDelete = trackMissingComparisonSteps[0].swapOrDelete;
                  const swapOrDeleteNodes = trackMissingComparisonSteps[0].swapOrDeleteNodes;
                  const swapComparisonNodes = [];

                  for (let i = highestIndexBeforeGap + 1; i < lowestIndexAfterGap; i++) {
                    const step = comparisonPathData.steps[i];
                    const swapNode = {
                      comparisonStepIndex: i,
                      comparisonStepPanBlock: step.panBlock,
                    };
                    swapComparisonNodes.push(swapNode);
                    // debugger;
                  }


                  if (swapOrDelete && swapOrDeleteNodes) {
                    // Deletion not detected on initial pass
                    trackMissingComparisonSteps.forEach((missingStep) => {
                      missingStep.swap = missingStep.swapOrDelete || true;
                      missingStep.swapPivotNodes = missingStep.swapOrDeleteNodes || swapOrDeleteNodes;
                      missingStep.swapComparisonNodes = swapComparisonNodes;

                      // TODO: Fill in missing nodes from nodes between the start and end

                      if (missingStep.swapPivotNodes && !missingStep.swapPivotNodes.find(node => node.pivotStepIndex === missingStep.pivotStepIndex)) {
                        const swapNode = {
                          pivotStepIndex: missingStep.pivotStepIndex,
                          pivotStepPanBlock: missingStep.panBlock,
                        };
                        missingStep.swapPivotNodes.push(swapNode);
                        missingStep.swapPivotNodes.sort((a, b) => a.pivotStepIndex - b.pivotStepIndex);
                        // debugger;
                      }

                      delete missingStep.swapOrDelete;
                      delete missingStep.swapOrDeleteNodes;
                      // debugger;

                    });
                    // debugger;
                    lastPresentStepBeforeMissing = pivotStep
                    firstPresentStepAfterMissing = null;
                    trackMissingComparisonSteps = [];

                  } else {
                    // Swap detected on initial pass
                    // debugger;
                    pivotStep.swapComparisonNodes = swapComparisonNodes;
                    lastPresentStepBeforeMissing = pivotStep
                    firstPresentStepAfterMissing = null;
                    trackMissingComparisonSteps = [];
                  }
                }
              }
            }
          }
        } else {
          trackMissingComparisonSteps.push(pivotStep);
        }
      });
    }
    // console.log('innerLoopResult', innerLoopResult);
    // debugger;
  });

  // console.log('pivotPathName', pivotPathName);
  // console.log('pivots', pivots);

  return {pivots};
};


const enumeratePangenomePathsInnerLoop = ({
                                            pangenomeImport,
                                            // pivotsImport,
                                            pivotPathName,
                                            pivotPathData,
                                            comparisonPathName,
                                            comparisonPathData
                                          }) => {


  if (pivotPathName === comparisonPathName) {
    return;
  }
  // const pivotName = `${pivotPathName}#${comparisonPathName}`;

  // if (!pivotsImport[pivotName]) {
  //   pivotsImport[pivotName] = [];
  // }
  //
  // const pivot = pivotsImport[pivotName];

  const pivot = {
    array: [],
    blocks: {},
  };

  let lastPivotStep;

  let lastPresentPivotStep;
  let firstAbsentPivotStepAfterLastPresentPivotStep;

  let lastAbsentPivotStep;
  let lastAbsentPivotStepBeforeLastPresentPivotStep;

  pivotPathData.steps.forEach((pivotPathStep, pivotPathStepsIndex) => {

    const stepResult = enumeratePivotDataPathSteps({
      comparisonPathData,
      pangenomeImport,
      pivotPathStep,
      pivotPathStepsIndex,

      lastPivotStep,
      lastPresentPivotStep,
      lastAbsentPivotStep,
      lastAbsentPivotStepBeforeLastPresentPivotStep,
      firstAbsentPivotStepAfterLastPresentPivotStep
    });

    const pivotStep = stepResult.pivotStep;
    lastPivotStep = stepResult.lastPivotStep;
    lastPresentPivotStep = stepResult.lastPresentPivotStep;
    lastAbsentPivotStep = stepResult.lastAbsentPivotStep;
    lastAbsentPivotStepBeforeLastPresentPivotStep = stepResult.lastAbsentPivotStepBeforeLastPresentPivotStep;
    firstAbsentPivotStepAfterLastPresentPivotStep = stepResult.firstAbsentPivotStepAfterLastPresentPivotStep;

    pivot.array.push(pivotStep);
    pivot.blocks[pivotStep.panBlock] = pivotStep;
  });

  // console.log('pivotPathName', pivotPathName, 'comparisonPathName', comparisonPathName);
  // console.log('pivot', pivot);
  // debugger;

  return {pivot}

};

const enumeratePivotDataPathSteps = ({
                                       // pivot,
                                       firstAbsentPivotStepAfterLastPresentPivotStep,
                                       lastAbsentPivotStepBeforeLastPresentPivotStep,
                                       lastAbsentPivotStep,
                                       lastPivotStep,
                                       lastPresentPivotStep,
                                       comparisonPathData,
                                       pangenomeImport,
                                       pivotPathStep,
                                       pivotPathStepsIndex
                                     }) => {
  const pivotPathStepSkeletonBlock = pangenomeImport.panSkeleton[pivotPathStep.panBlock];
  const pivotStep = {
    panBlock: pivotPathStep.panBlock,
    pivotStepIndex: pivotPathStepsIndex
  };
  // pivot.push(pivotStep);

  let lastComparisonPathStep;
  comparisonPathData.steps.forEach((comparisonPathStep, comparisonPathStepsIndex) => {

    const comparisonStepResult = enumerateComparisonDataPathSteps({
      pivotPathStepSkeletonBlock,
      pivotStep,
      pangenomeImport,
      comparisonPathStep,
      lastComparisonPathStep,
      comparisonPathStepsIndex,
      pivotPathStepsIndex,
      pivotPathStep,
      lastPivotStep,
      comparisonPathData,
    });

    lastComparisonPathStep = comparisonStepResult.lastComparisonPathStep;
  });

  // console.log("PRE", "\n\tpivotStep\t", pivotStep && pivotStep.panBlock, "\n\tlastPivotStep\t", lastPivotStep && lastPivotStep.panBlock, "\n\tlastPresentPivotStep\t", lastPresentPivotStep && lastPresentPivotStep.panBlock, "\n\tlastAbsentPivotStep\t", lastAbsentPivotStep && lastAbsentPivotStep.panBlock, "\n\tfirstAbsentPivotStepAfterLastPresentPivotStep\t", firstAbsentPivotStepAfterLastPresentPivotStep && firstAbsentPivotStepAfterLastPresentPivotStep.panBlock, "\n\tlastAbsentPivotStepBeforeLastPresentPivotStep\t", lastAbsentPivotStepBeforeLastPresentPivotStep && lastAbsentPivotStepBeforeLastPresentPivotStep.panBlock);

  if (!pivotStep.present) {
    if (lastPivotStep && lastPivotStep.present) {
      firstAbsentPivotStepAfterLastPresentPivotStep = pivotStep;
      firstAbsentPivotStepAfterLastPresentPivotStep.swapOrDelete = "start";

      const swapNode = {
        pivotStepIndex: pivotPathStepsIndex,
        pivotStepPanBlock: pivotPathStep.panBlock,
      };

      firstAbsentPivotStepAfterLastPresentPivotStep.swapOrDeleteNodes = [
        swapNode
      ];

      lastAbsentPivotStepBeforeLastPresentPivotStep = null;
    }
  }

  if (pivotStep.present) {
    if (lastPivotStep && !lastPivotStep.present) {

      if (firstAbsentPivotStepAfterLastPresentPivotStep) {
        lastAbsentPivotStepBeforeLastPresentPivotStep = lastPivotStep;
        lastAbsentPivotStepBeforeLastPresentPivotStep.swapOrDelete = "end";
        lastAbsentPivotStepBeforeLastPresentPivotStep.swapOrDeleteNodes = firstAbsentPivotStepAfterLastPresentPivotStep.swapOrDeleteNodes;

        const swapNode = {
          pivotStepIndex: lastPivotStep.pivotStepIndex,
          pivotStepPanBlock: lastPivotStep.panBlock,
        };

        if (firstAbsentPivotStepAfterLastPresentPivotStep !== lastAbsentPivotStepBeforeLastPresentPivotStep) {
          firstAbsentPivotStepAfterLastPresentPivotStep.swapOrDeleteNodes.push(swapNode);
        } else {
          lastAbsentPivotStepBeforeLastPresentPivotStep.swapOrDelete = 'solo';
        }

        // console.log('lastPresentPivotStep', lastPresentPivotStep && lastPresentPivotStep.comparisonStepIndex, 'pivotStep', pivotStep.comparisonStepIndex);

        // There was no gap in the comparison path, so it was merely a deletion (not a swap)
        if (lastPresentPivotStep && lastPresentPivotStep.comparisonStepIndex === pivotStep.comparisonStepIndex - 1) {
          firstAbsentPivotStepAfterLastPresentPivotStep.deleted = firstAbsentPivotStepAfterLastPresentPivotStep.swapOrDelete;
          lastAbsentPivotStepBeforeLastPresentPivotStep.deleted = lastAbsentPivotStepBeforeLastPresentPivotStep.swapOrDelete;

          firstAbsentPivotStepAfterLastPresentPivotStep.deletedNodes = firstAbsentPivotStepAfterLastPresentPivotStep.swapOrDeleteNodes;
          lastAbsentPivotStepBeforeLastPresentPivotStep.deletedNodes = lastAbsentPivotStepBeforeLastPresentPivotStep.swapOrDeleteNodes;

          delete firstAbsentPivotStepAfterLastPresentPivotStep.swapOrDelete;
          delete lastAbsentPivotStepBeforeLastPresentPivotStep.swapOrDelete;

          delete firstAbsentPivotStepAfterLastPresentPivotStep.swapOrDeleteNodes;
          delete lastAbsentPivotStepBeforeLastPresentPivotStep.swapOrDeleteNodes;

        }

        firstAbsentPivotStepAfterLastPresentPivotStep = null;
        lastAbsentPivotStepBeforeLastPresentPivotStep = null;

      }
    }
  }

  if (!pivotStep.present) {
    lastAbsentPivotStep = pivotStep;
  }

  if (pivotStep.present) {
    lastPresentPivotStep = pivotStep;
  }

  lastPivotStep = pivotStep;

  // console.log("POST", "\n\tpivotStep\t", pivotStep && pivotStep.panBlock, "\n\tlastPivotStep\t", lastPivotStep && lastPivotStep.panBlock, "\n\tlastPresentPivotStep\t", lastPresentPivotStep && lastPresentPivotStep.panBlock, "\n\tlastAbsentPivotStep\t", lastAbsentPivotStep && lastAbsentPivotStep.panBlock, "\n\tfirstAbsentPivotStepAfterLastPresentPivotStep\t", firstAbsentPivotStepAfterLastPresentPivotStep && firstAbsentPivotStepAfterLastPresentPivotStep.panBlock, "\n\tlastAbsentPivotStepBeforeLastPresentPivotStep\t", lastAbsentPivotStepBeforeLastPresentPivotStep && lastAbsentPivotStepBeforeLastPresentPivotStep.panBlock);

  return {
    pivotStep,
    lastPivotStep,
    lastPresentPivotStep,
    lastAbsentPivotStep,
    lastAbsentPivotStepBeforeLastPresentPivotStep,
    firstAbsentPivotStepAfterLastPresentPivotStep
  };

};

const enumerateComparisonDataPathSteps = ({
                                            pivotPathStepSkeletonBlock,
                                            pivotStep,
                                            pangenomeImport,
                                            comparisonPathStep,
                                            lastComparisonPathStep,
                                            comparisonPathStepsIndex,
                                            pivotPathStepsIndex,
                                            pivotPathStep,
                                            lastPivotStep,
                                            comparisonPathData,
                                          }) => {

  // Detect highest index if it was an inversion chain
  let highestComparisonStepIndex = lastPivotStep ? lastPivotStep.comparisonStepIndex : undefined;
  if (lastPivotStep && lastPivotStep.inversionChain) {
    lastPivotStep.inversionChainNodes.forEach(step => highestComparisonStepIndex = Math.max(highestComparisonStepIndex, step.comparisonStepIndex));
  }
  
  const comparisonPathStepSkeletonBlock = pangenomeImport.panSkeleton[comparisonPathStep.panBlock];

  if (pivotPathStepSkeletonBlock.dupes.includes(comparisonPathStep.panBlock)) {
    pivotStep.dupe = true;
    if (!pivotStep.dupeNodes) {
      pivotStep.dupeNodes = [];
    }
    const dupeNode = {
      pivotStepIndex: pivotPathStepsIndex,
      pivotStepPanBlock: pivotPathStep.panBlock,
      comparisonStepIndex: comparisonPathStepsIndex,
      comparisonStepPanBlock: comparisonPathStep.panBlock
    };
    pivotStep.dupeNodes.push(dupeNode);
  }

  // INVERSION, INSERTION, or INVERSION CHAIN
  if (pivotPathStep.panBlock === comparisonPathStep.panBlock) {
    pivotStep.present = true;
    pivotStep.comparisonStepIndex = comparisonPathStepsIndex;

    // INVERSION
    if (pivotPathStep.strand !== comparisonPathStep.strand) {
      pivotStep.inversion = true;
    }

    if (lastPivotStep) {

      // DELETION
      if (lastPivotStep.pivotStepIndex < pivotStep.pivotStepIndex - 1) {
        // Don't think I can detect deletion here
        pivotStep.deletion = true;
      }

      // INSERTION
      if (highestComparisonStepIndex < pivotStep.comparisonStepIndex - 1) {
        pivotStep.insertion = true;
        pivotStep.insertionNodes = [];

        for (let insertionPathStepsIndex = highestComparisonStepIndex + 1; insertionPathStepsIndex < pivotStep.comparisonStepIndex; insertionPathStepsIndex++) {
          const insertionPathStep = comparisonPathData.steps[insertionPathStepsIndex];
          const insertionPathStepSkeletonBlock = pangenomeImport.panSkeleton[insertionPathStep.panBlock];

          const insertionNode = {
            pivotStepIndex: pivotPathStepsIndex,
            pivotStepPanBlock: pivotPathStep.panBlock,
            comparisonStepIndex: insertionPathStepsIndex,
            comparisonStepPanBlock: insertionPathStep.panBlock,
          };
          pivotStep.insertionNodes.push(insertionNode);
        }
      }

      // INVERSION CHAIN
      // Check the comparison step indices, if the last one is higher than this one,
      // they're decrementing as the pivot steps increment and probably an inversion chain
      if (highestComparisonStepIndex === pivotStep.comparisonStepIndex + 1 || lastPivotStep.comparisonStepIndex === pivotStep.comparisonStepIndex + 1) {

        const inversionChainNodes = lastPivotStep.inversionChainNodes || [];

        lastPivotStep.inversionChainNodes = inversionChainNodes;
        pivotStep.inversionChainNodes = inversionChainNodes;

        // Current step is inside an inversion chain
        // pivotStep.inversionChain = pivotStep.inversionChain || "";
        pivotStep.inversionChain = true;

        if (pivotStep.inversionChain && !lastPivotStep.inversionChain) {
          // Last step was the start of this inversion chain
          lastPivotStep.inversionChain = 'start';

          const inversionChainNode = {
            pivotStepIndex: lastPivotStep.pivotStepIndex,
            pivotStepPanBlock: lastPivotStep.panBlock,
            comparisonStepIndex: lastPivotStep.comparisonStepIndex,
            highestComparisonStepIndex,
            comparisonStepPanBlock: lastPivotStep.panBlock
          };
          inversionChainNodes.push(inversionChainNode);

        } else {
          // Last step was inside an inversion chain
          lastPivotStep.inversionChain = true;
        }

        const inversionChainNode = {
          pivotStepIndex: pivotPathStepsIndex,
          pivotStepPanBlock: pivotPathStep.panBlock,
          comparisonStepIndex: comparisonPathStepsIndex,
          comparisonStepPanBlock: comparisonPathStep.panBlock
        };

        inversionChainNodes.push(inversionChainNode);

      }

      if (lastPivotStep.inversionChain && !pivotStep.inversionChain) {
        // Current step is after (outside) an inversion chain, last step was last inside the inversion chain
        lastPivotStep.inversionChain = 'end';
      }
    }

  } else {


    // Detect swap and/or delete??

    // console.log('\n\tpivotPathStepsIndex\t', pivotPathStepsIndex, '\n\tcomparisonPathStepsIndex\t', comparisonPathStepsIndex, '\n\tpivotStep\t', pivotStep, '\n\tlastPivotStep\t', lastPivotStep, '\n\tpivotPathStep\t', pivotPathStep, '\n\tcomparisonPathStep\t', comparisonPathStep, '\n\tlastComparisonPathStep\t', lastComparisonPathStep);
  }

  lastComparisonPathStep = comparisonPathStep;

  return { lastComparisonPathStep };
};


const getDataInternal = async () => {
  if (dataCache) {
    return dataCache;
  }
  const { default: pangenomeImportDefault, ...pangenomeImport } = await import(
    "../data/sample/handcrafted3AssembliesPangenome.json"
    );

  const { default: pivotsImportDefault, ...pivotsImport } = await import("../data/sample/pivots.json");

  const trackedPivotNodes = {};
  const trackedPathNodes = {};

  const pivots = {};
  Object.entries(pangenomeImport.paths).forEach(([pivotPathName, pivotPathData]) => {
    const outerLoopResult = enumeratePangenomePathsOuterLoop({
      pangenomeImport,
      pivotsImport,
      pivotPathName,
      pivotPathData
    });

    if (outerLoopResult && outerLoopResult.pivots) {
      Object.assign(pivots, outerLoopResult.pivots);
    }


  });

  console.log('pivots', pivots);

  dataCache = { pangenome: pangenomeImport.default || pangenomeImport, pivots };

  return dataCache;
};