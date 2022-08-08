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

//TODO Description
const buildThenExpandAnnotations = ({
                                            pangenomeImport,
                                            // pivotsImport,
                                            pivotPathName,
                                            pivotPathData,
                                            chromName
                                          }) => {

  const pivots = {};

  //---------------------------
  //--------------------------- ForEach pathName x pathData
  //---------------------------

  Object.entries(pangenomeImport.paths).forEach(([comparedPathName, comparedPathData]) => {

    const innerLoopResult = parsePivotSteps({
      pangenomeImport,
      // pivotsImport,
      pivotPathName,
      pivotPathData,
      comparedPathName,
      comparedPathData
    });

    if (innerLoopResult && innerLoopResult.pivot) {
      // const pivotName = `${pivotPathName}#${comparedPathName}`;

      // FILL PIVOTS DICT WITH ANNOTATIONS
      if (!pivots[pivotPathName]) {
        pivots[pivotPathName] = {};
      }
      if (!pivots[pivotPathName][comparedPathName]) {
        pivots[pivotPathName][comparedPathName] = {};
      }
      Object.assign(pivots[pivotPathName][comparedPathName], innerLoopResult.pivot);

      let trackMissingComparisonSteps = [];
      let lastPresentStepBeforeMissing;
      let firstPresentStepAfterMissing;

      // SECOND PASS  for (trailing) DELETION / SWAP DETECTION
      innerLoopResult.pivot.array.forEach((annotPivotStep, pivotStepIndex) => {

        //---------------- QUESTION: Could we do this outside of this loop? Within the innerLoop instead, once everything is parsed?
        if (pivotStepIndex === innerLoopResult.pivot.array.length - 1 && annotPivotStep.comparedPathStepIndex === undefined) {
          // Detect if at the end of the array and there's still a swap or delete leftover
          // (Doing this because the rest of the process expects another "present" step to close the swap or gap)
          trackMissingComparisonSteps.push(annotPivotStep);
          // firstPresentStepAfterMissing = pivotStepIndex;
        }

        //---------------- QUESTION: I am not quite sure what this part does
        //---------------- QUESTION: does 'Missing' === 'Absent' here?
        //---------------- ie trackAbsentPivotSteps instead of trackMissingComparisonSteps
        //---------------- I am unsure wether it looks for comparisons that haven't been made
        //---------------- or simply pivot steps labelled as absent (or rather not labelled as present)
        if (annotPivotStep.comparedPathStepIndex !== undefined || pivotStepIndex === innerLoopResult.pivot.array.length - 1) {

          if (trackMissingComparisonSteps.length === 0) {
            lastPresentStepBeforeMissing = annotPivotStep;

          // If there is 1+ missing comparison step... (absent compared step?)
          } else {
            firstPresentStepAfterMissing = annotPivotStep;

            // Without any gap opening...
            if (!lastPresentStepBeforeMissing) {
              // Do nothing, this is dangling at the front of the path
              // debugger;
              lastPresentStepBeforeMissing = annotPivotStep;
              firstPresentStepAfterMissing = null;
              trackMissingComparisonSteps = [];

            // With a gap opening
            } else {

              // Detect an inversion chain before or after a deletion or swap, that can confuse where the variation starts or ends

              let highestIndexBeforeGap = lastPresentStepBeforeMissing.comparedPathStepIndex;
              let lowestIndexAfterGap = firstPresentStepAfterMissing.comparedPathStepIndex;

              if (lastPresentStepBeforeMissing.inversionChain) {
                // Inversion Chain before Swap or Deletion
                lastPresentStepBeforeMissing.inversionChainNodes.forEach(node => highestIndexBeforeGap = Math.max(highestIndexBeforeGap, node.comparedPathStepIndex));
              }

              if (firstPresentStepAfterMissing.inversionChain) {
                // Inversion Chain after Swap or Deletion
                firstPresentStepAfterMissing.inversionChainNodes.forEach(node => lowestIndexAfterGap = Math.min(lowestIndexAfterGap, node.comparedPathStepIndex));
              }

              if (highestIndexBeforeGap === lowestIndexAfterGap - 1) {
                // SECOND PASS DELETION

                const swapOrDelete = trackMissingComparisonSteps[0].swapOrDelete;
                const swapOrDeleteNodes = trackMissingComparisonSteps[0].swapOrDeleteNodes;
                if (swapOrDelete && swapOrDeleteNodes) {
                  // Deletion not detected on initial pass
                  trackMissingComparisonSteps.forEach((missingStep) => {
                    missingStep.deleted = missingStep.swapOrDelete || true;
                    missingStep.deletedNodes = missingStep.swapOrDeleteNodes || swapOrDeleteNodes;

                    if (missingStep.deletedNodes && !missingStep.deletedNodes.find(node => node.pivotStepIndex === missingStep.pivotStepIndex)) {
                      const deletedNode = {
                        pivotStepIndex: missingStep.pivotStepIndex,
                        pivotStepPanBlock: missingStep.panBlock
                      };
                      missingStep.deletedNodes.push(deletedNode);
                      missingStep.deletedNodes.sort((a, b) => a.pivotStepIndex - b.pivotStepIndex);
                    }

                    delete missingStep.swapOrDelete;
                    delete missingStep.swapOrDeleteNodes;

                  });
                  lastPresentStepBeforeMissing = annotPivotStep;
                  firstPresentStepAfterMissing = null;
                  trackMissingComparisonSteps = [];

                } else {
                  // Deletion detected on initial pass
                  lastPresentStepBeforeMissing = annotPivotStep;
                  firstPresentStepAfterMissing = null;
                  trackMissingComparisonSteps = [];
                }
              } else {
                // SECOND PASS SWAP

                if (trackMissingComparisonSteps[0].swapOrDelete && trackMissingComparisonSteps[0].swapOrDeleteNodes) {
                  // Swap not detected on initial pass
                  const swapOrDelete = trackMissingComparisonSteps[0].swapOrDelete;
                  const swapOrDeleteNodes = trackMissingComparisonSteps[0].swapOrDeleteNodes;
                  const swapComparisonNodes = [];

                  for (let i = highestIndexBeforeGap + 1; i < lowestIndexAfterGap; i++) {
                    const step = comparedPathData[chromName][i];
                    const swapNode = {
                      comparedPathStepIndex: i,
                      comparedPathStepPanBlock: step.panBlock
                    };
                    swapComparisonNodes.push(swapNode);
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
                          pivotStepPanBlock: missingStep.panBlock
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
                    lastPresentStepBeforeMissing = annotPivotStep;
                    firstPresentStepAfterMissing = null;
                    trackMissingComparisonSteps = [];

                  } else {
                    // Swap detected on initial pass
                    // debugger;
                    annotPivotStep.swapComparisonNodes = swapComparisonNodes;
                    lastPresentStepBeforeMissing = annotPivotStep;
                    firstPresentStepAfterMissing = null;
                    trackMissingComparisonSteps = [];
                  }
                }
              }
            }
          }
        } else {
          trackMissingComparisonSteps.push(annotPivotStep);
        }
      });
    }
    // console.log('innerLoopResult', innerLoopResult);
    // debugger;
  });

  // console.log('pivotPathName', pivotPathName);
  // console.log('pivots', pivots);

  return { pivots };
};

//---------------- Builds comparison with pivot for a given path
// It loops through all pivot steps to annotate all SVs with annotatePivotStep
// and builds an array of consectutive annotated steps, and dict of annotations per panBlock
// Returns an object named 'pivot', with a property 'array' listing all successive
// annotated Steps, and 'blocks' containing all annotated steps as linked to keys defined
// by the panBlock IDs
const parsePivotSteps = ({
                                            pangenomeImport,
                                            // pivotsImport,
                                            pivotPathName,
                                            pivotPathData,
                                            comparedPathName,
                                            comparedPathData
                                          }) => {


  //------------------Applied only to compared paths
  //------------------ QUESTION: Users might want to run it on the pivot too, to see coocs within pivot
  if (pivotPathName === comparedPathName) {
    return;
  }

  //The 'pivot', listing all annotated steps, is returned at the end
  const pivot = {
    array: [],
    blocks: {}
  };

  let previousPivotStep;
  let lastPresentPivotStep;
  let firstSwappedPivotStep;
  let lastAbsentPivotStep;
  let lastSwappedPivotStep;

  //--------------- Parsing the pivot data
  pivotPathData.steps.forEach((pivotStep, pivotStepIndex) => {

    //------------- 'stepResult' == multiple SV annotated objects, reusable within the loop
    const stepResult = annotatePivotStep({
      chromName,
      comparedPathData,
      pangenomeImport,
      pivotStep,
      pivotStepIndex,

      previousPivotStep,
      lastPresentPivotStep,
      lastAbsentPivotStep,
      lastSwappedPivotStep,
      firstSwappedPivotStep
    });

    const annotPivotStep = stepResult.annotPivotStep;
    previousPivotStep = stepResult.previousPivotStep;
    lastPresentPivotStep = stepResult.lastPresentPivotStep;
    lastAbsentPivotStep = stepResult.lastAbsentPivotStep;
    lastSwappedPivotStep = stepResult.lastSwappedPivotStep;
    firstSwappedPivotStep = stepResult.firstSwappedPivotStep;

    //-------------- QUESTION: Seems redundant, why have multiple copies of annotPivotStep? Ain't it heavy?
    //-------------- Could we just have 'blocks', with array simply storing the panBlock IDs, so that index and annotPivotStep are still linked?
    //-------------- QUESTION: How are cascaded the SV on previous annotPivotSteps? (ex info on end of Swap, continuity of inversionChain...)
    pivot.array.push(annotPivotStep);
    pivot.blocks[annotPivotStep.panBlock] = annotPivotStep;
  });

  // console.log('pivotPathName', pivotPathName, 'comparedPathName', comparedPathName);
  // console.log('pivot', pivot);
  // debugger;

  return { pivot };

};

//---------------- Checks SV at a pivot step
// It looks for all SVs of annotateComparisonOfTwoSteps, and looks for SWAPS
// or DELETIONS
// Returns an object containing the updated annotPivotStep, the previous annotPivotStep,
// the latest Absent or latest Present annotPivotStep, and the first and last Swapped
// annotPivotStep, which could be objects or null
const annotatePivotStep = ({
                                       // pivot,
                                       chromName,
                                       comparedPathData,
                                       pangenomeImport,
                                       pivotStep,
                                       pivotStepIndex,
                                       previousPivotStep,
                                       lastPresentPivotStep,
                                       lastAbsentPivotStep,
                                       lastSwappedPivotStep,
                                       firstSwappedPivotStep
                                     }) => {

  //---------------- Node object, traversed by the current pivot step
  const traversedPanBlock = pangenomeImport.panSkeleton[pivotStep.panBlock];

  //---------------- Stores node ID + step index
  const annotPivotStep = {
    panBlock: pivotStep.panBlock,
    pivotStepIndex: pivotStepIndex
  };

  // Increments annotPivotStep with found SVs (Dupes, Presence, Insertion, Inversion, Deletion, InversionChain)
  let previousComparedPathStep;
  comparedPathData[chromName].forEach((comparedPathStep, comparedPathStepIndex) => {

    const comparedPathStepResult = annotateComparisonOfTwoSteps({
      chromName,
      traversedPanBlock,
      annotPivotStep,
      pangenomeImport,
      comparedPathStep,
      previousComparedPathStep,
      comparedPathStepIndex,
      pivotStepIndex,
      pivotStep,
      previousPivotStep,
      comparedPathData
    });

    previousComparedPathStep = comparedPathStepResult.previousComparedPathStep;
  });

  // console.log("PRE", "\n\tpivotStep\t", annotPivotStep && annotPivotStep.panBlock, "\n\tpreviousPivotStep\t", previousPivotStep && previousPivotStep.panBlock, "\n\tlastPresentPivotStep\t", lastPresentPivotStep && lastPresentPivotStep.panBlock, "\n\tlastAbsentPivotStep\t", lastAbsentPivotStep && lastAbsentPivotStep.panBlock, "\n\tfirstSwappedPivotStep\t", firstSwappedPivotStep && firstSwappedPivotStep.panBlock, "\n\tlastSwappedPivotStep\t", lastSwappedPivotStep && lastSwappedPivotStep.panBlock);

  // Checks for the start or end of SWAPS and DELETIONS

  if (!annotPivotStep.present) {

    // In case of Absence after a present Node/annotPivotStep, stores start of swap
    if (previousPivotStep && previousPivotStep.present) {
      firstSwappedPivotStep = annotPivotStep;
      firstSwappedPivotStep.swapOrDelete = "start";

      const swapNode = {
        pivotStepIndex: pivotStepIndex,
        pivotStepPanBlock: pivotStep.panBlock
      };

      firstSwappedPivotStep.swapOrDeleteNodes = [
        swapNode
      ];

      lastSwappedPivotStep = null;
    }
  }

  if (annotPivotStep.present) {

    // In case of Presence after an Absence...
    if (previousPivotStep && !previousPivotStep.present) {

      // ...if it is a gap closure (and not the first presence at the beginning, for example)
      //------------ QUESTION: what if there is a swap at the very beginning ?
      if (firstSwappedPivotStep) {

        lastSwappedPivotStep = previousPivotStep;
        lastSwappedPivotStep.swapOrDelete = "end";
        lastSwappedPivotStep.swapOrDeleteNodes = firstSwappedPivotStep.swapOrDeleteNodes;

        const swapNode = {
          pivotStepIndex: previousPivotStep.pivotStepIndex,
          pivotStepPanBlock: previousPivotStep.panBlock
        };

        // Either stores last swapped annotPivotStep coords, or mark annotPivotStep as a solo swap
        if (firstSwappedPivotStep !== lastSwappedPivotStep) {
          //--------------- QUESTION, is this cascaded on lastSwappedPivotStep.swapOrDeleteNodes ?
          firstSwappedPivotStep.swapOrDeleteNodes.push(swapNode);
        } else {
          lastSwappedPivotStep.swapOrDelete = "solo";
        }

        // console.log('lastPresentPivotStep', lastPresentPivotStep && lastPresentPivotStep.comparedPathStepIndex, 'annotPivotStep', annotPivotStep.comparedPathStepIndex);

        // There was no gap in the comparison path, so it was merely a deletion (not a swap)
        // DELETION, overwrites swapOrDelete
        if (lastPresentPivotStep && lastPresentPivotStep.comparedPathStepIndex === annotPivotStep.comparedPathStepIndex - 1) {
          firstSwappedPivotStep.deleted = firstSwappedPivotStep.swapOrDelete;
          lastSwappedPivotStep.deleted = lastSwappedPivotStep.swapOrDelete;

          firstSwappedPivotStep.deletedNodes = firstSwappedPivotStep.swapOrDeleteNodes;
          lastSwappedPivotStep.deletedNodes = lastSwappedPivotStep.swapOrDeleteNodes;

          delete firstSwappedPivotStep.swapOrDelete;
          delete lastSwappedPivotStep.swapOrDelete;

          delete firstSwappedPivotStep.swapOrDeleteNodes;
          delete lastSwappedPivotStep.swapOrDeleteNodes;

        }

        firstSwappedPivotStep = null;
        lastSwappedPivotStep = null;

      }
    }
  }

  if (!annotPivotStep.present) {
    lastAbsentPivotStep = annotPivotStep;
  }

  if (annotPivotStep.present) {
    lastPresentPivotStep = annotPivotStep;
  }

  previousPivotStep = annotPivotStep;

  // console.log("POST", "\n\tpivotStep\t", annotPivotStep && annotPivotStep.panBlock, "\n\tpreviousPivotStep\t", previousPivotStep && previousPivotStep.panBlock, "\n\tlastPresentPivotStep\t", lastPresentPivotStep && lastPresentPivotStep.panBlock, "\n\tlastAbsentPivotStep\t", lastAbsentPivotStep && lastAbsentPivotStep.panBlock, "\n\tfirstSwappedPivotStep\t", firstSwappedPivotStep && firstSwappedPivotStep.panBlock, "\n\tlastSwappedPivotStep\t", lastSwappedPivotStep && lastSwappedPivotStep.panBlock);

  return {
    annotPivotStep,
    previousPivotStep,
    lastPresentPivotStep,
    lastAbsentPivotStep,
    //----------- QUESTION: isn't the lastSwappedPivotStep always nullified?
    lastSwappedPivotStep,
    firstSwappedPivotStep
  };

};

//---------------- Checks local SV between pivot and path Steps
// It compares current annotPivotStep with any comparedStep (and the direct previous steps)
// Writes coocs, present, comparedPathStepIndex, inversion, !deletion!, insertion, inversionChain
// and the related nodes ({index and ID in pivot, index and ID in comparison, (highestComparisonStepIndex)})
// into annotPivotStep as properties of an object.
// Returns an object containing the studied comparedStep
const annotateComparisonOfTwoSteps = ({
                                            chromName,
                                            traversedPanBlock,
                                            annotPivotStep,
                                            comparedPathData,
                                            previousComparedPathStep,
                                            comparedPathStep,
                                            comparedPathStepIndex,
                                            previousPivotStep,
                                            pivotStep,
                                            pivotStepIndex
                                          }) => {

  //--------------- Index of previous pivot Step/Node in the compared path, or highest for Inv. Chains
  // Detect highest index if it was an inversion chain
  let highestComparisonStepIndex = previousPivotStep ? previousPivotStep.comparedPathStepIndex : undefined;
  if (previousPivotStep && previousPivotStep.inversionChain) {
    //---------- QUESTION: highestComparisonStepIndex is supposed to be the same through all Steps of an invChain, why check this?
    //---------- It is even non-existent in all Steps but the starting one!
    previousPivotStep.inversionChainNodes.forEach(step => highestComparisonStepIndex = Math.max(highestComparisonStepIndex, step.comparedPathStepIndex));
  }

  //-------------- Checks if the current compared Step is a cooc of the current pivot Step
  //-------------- QUESTION: can we call it 'cooc(s)' instead of 'cooc(s)'
  // COOCCURRENCES
  if (traversedPanBlock.coocs.includes(comparedPathStep.panBlock)) {
    annotPivotStep.cooc = true;
    if (!annotPivotStep.coocNodes) {
      annotPivotStep.coocNodes = [];
    }

    //--------------- Stores found cooc
    const coocNode = {
      //---------------- QUESTION: Why rewrite pivotStepIndex and pivotStepPanBlock?
      pivotStepIndex: pivotStepIndex,
      pivotStepPanBlock: pivotStep.panBlock,
      comparedPathStepIndex: comparedPathStepIndex,
      comparedPathStepPanBlock: comparedPathStep.panBlock
    };
    annotPivotStep.coocNodes.push(coocNode);
  }

  // PRESENCE, then INVERSION, INSERTION, or INVERSION CHAIN
  if (pivotStep.panBlock === comparedPathStep.panBlock) {

    //----------------- QUESTION: Why not directly check and target the index
    // with the data? panSkeleton[panBlock_ID]['traversals'][compared_ID]
    // Looping through all compared Steps to find the good one seems unecessary
    //PRESENCE
    annotPivotStep.present = true;
    annotPivotStep.comparedPathStepIndex = comparedPathStepIndex;

    // INVERSION
    if (pivotStep.strand !== comparedPathStep.strand) {
      annotPivotStep.inversion = true;
      if (!annotPivotStep.inversionNodes) {
        annotPivotStep.inversionNodes = [];
      }
      const inversionNode = {
        pivotStepIndex: pivotStepIndex,
        pivotStepPanBlock: pivotStep.panBlock,
        comparedPathStepIndex: comparedPathStepIndex,
    //--------------- QUESTION: supposed to be the same as pivot, why write it?
        comparedPathStepPanBlock: comparedPathStep.panBlock
      };
      annotPivotStep.inversionNodes.push(inversionNode);
    }

    //-------------- If there is a previous Step in the pivot...
    if (previousPivotStep) {

      // DELETION
      //----------------------- CAUTION
      //----------------------- Not working, as all pivot steps are parsed in consecutive order
      //----------------------- Condition below can never be met
      if (previousPivotStep.pivotStepIndex < annotPivotStep.pivotStepIndex - 1) {
        // Don't think I can detect deletion here
        annotPivotStep.deletion = true;
      }

      // INSERTION
      //----------------- QUESTION: What happens if highestComparisonStepIndex is undefined (eg. absent from previous annotPivotStep)?
      if (highestComparisonStepIndex < annotPivotStep.comparedPathStepIndex - 1) {
        annotPivotStep.insertion = true;
        annotPivotStep.insertionNodes = [];

        for (let insertionPathStepsIndex = highestComparisonStepIndex + 1;
          insertionPathStepsIndex < annotPivotStep.comparedPathStepIndex;
          insertionPathStepsIndex++) {
          const insertionPathStep = comparedPathData[chromName][insertionPathStepsIndex];

          const insertionNode = {
            //--------------- QUESTION: Why keep pivot panBlock? It is not within the compared path.
            pivotStepIndex: pivotStepIndex,
            pivotStepPanBlock: pivotStep.panBlock,
            comparedPathStepIndex: insertionPathStepsIndex,
            comparedPathStepPanBlock: insertionPathStep.panBlock
          };
          annotPivotStep.insertionNodes.push(insertionNode);
        }
      }

      // INVERSION CHAIN
      // Check the comparison step indices, if the previous one is higher than this one,
      // they're decrementing as the pivot steps increment and probably an inversion chain
      //-------------------- QUESTION: couldn't we just check previousPivotStep.comparedPathStepIndex?
      if (highestComparisonStepIndex === annotPivotStep.comparedPathStepIndex + 1 || previousPivotStep.comparedPathStepIndex === annotPivotStep.comparedPathStepIndex + 1) {

        //------------------ QUESTION: is it redefined with each new node within?
        //------------------ Or does it take the end-loop value by default, since it is a const?
        const inversionChainNodes = previousPivotStep.inversionChainNodes || [];

        previousPivotStep.inversionChainNodes = inversionChainNodes;
        annotPivotStep.inversionChainNodes = inversionChainNodes;

        // Current step is inside an inversion chain
        // annotPivotStep.inversionChain = annotPivotStep.inversionChain || "";
        annotPivotStep.inversionChain = true;

        //------------ Checking if the current node is part of inv chain seems redundant as it is stated just before
        if (annotPivotStep.inversionChain && !previousPivotStep.inversionChain) {
          // Last step was the start of this inversion chain
          previousPivotStep.inversionChain = "start";

          const inversionChainNode = {
            pivotStepIndex: previousPivotStep.pivotStepIndex,
            pivotStepPanBlock: previousPivotStep.panBlock,
            comparedPathStepIndex: previousPivotStep.comparedPathStepIndex,
            highestComparisonStepIndex,
            comparedPathStepPanBlock: previousPivotStep.panBlock
          };
          inversionChainNodes.push(inversionChainNode);

        //------------- QUESTION: Seems redundant, previousPivotStep.inversionChain === tru is already implied by the condition
        } else {
          // Last step was inside an inversion chain
          previousPivotStep.inversionChain = true;
        }

        const inversionChainNode = {
          pivotStepIndex: pivotStepIndex,
          pivotStepPanBlock: pivotStep.panBlock,
          comparedPathStepIndex: comparedPathStepIndex,
          comparedPathStepPanBlock: comparedPathStep.panBlock
        };

        //---------------- QUESTION: Does the push at the end of the loop does anything?
        //---------------- How is the previousPivotStep.inversionChainNodes updated?
        inversionChainNodes.push(inversionChainNode);

      }

      // END OF INVERSION CHAIN
      //----------------- QUESTION: What if the final step is within an inv Chain?, no 'end' attributed?
      if (previousPivotStep.inversionChain && !annotPivotStep.inversionChain) {
        // Current step is after (outside) an inversion chain, previous step was last inside the inversion chain
        previousPivotStep.inversionChain = "end";
      }
    }

  }

  previousComparedPathStep = comparedPathStep;

  return { previousComparedPathStep };
};


const getDataInternal = async () => {
  if (dataCache) {
    return dataCache;
  }

  let pangenomeImport = await import(
    "../data/sample/handcrafted3AssembliesPangenome.json"
    );

  const chromName = 'chrom1' // TODO: adapt it depending on user's choice within the app

  pangenomeImport = pangenomeImport.default || pangenomeImport;

  const pivots = {};
  Object.entries(pangenomeImport.paths).forEach(([pivotPathName, pivotPathData]) => {
    const outerLoopResult = buildThenExpandAnnotations({
      pangenomeImport,
      pivotPathName,
      pivotPathData,
      chromName
    });

    if (outerLoopResult && outerLoopResult.pivots) {
      Object.assign(pivots, outerLoopResult.pivots);
    }


  });

  console.log("pivots", pivots);

  dataCache = { pangenome: pangenomeImport.default || pangenomeImport, pivots };

  return dataCache;
};