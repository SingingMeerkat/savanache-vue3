//const dataCache = { pivots: {} };
//let dataCache = { pivots: {} };
let dataCache;
let chromNamesPerPath;
let promise;
let pivots;
let chromsRanAlready = [];

export const getData = (chromToDisplay) => {
  //Run promise only when needed : ie not promise yet, or not for the chossen chrom
  if (!promise || !chromsRanAlready.includes(chromToDisplay)) {
    chromsRanAlready.push(chromToDisplay);
    console.log("SV Annotation already built for the chosen chromosome.");
    promise = new Promise((resolve, reject) => {
      getDataInternal(chromToDisplay).then(resolve).catch(reject);
    });
  }
  return promise;
};

//---------------- Builds SV annotations on all paths, for a given chromName
// Loops through all paths to compare ('compared'), and builds SV annotation
// based on their differences with a 'pivot' path, reference coordinate system.
// It computes SV, and rerun comparison for expanding the details missed in early
// two versus two comparison steps (e.g. Swap with more than 2 nodes involved).
// Returns an object named 'pivots', with as many 'pivot' objects as path that
// should be compared. A specific comparison can be accessed with pivots[pivotName][comparedPathName]
// Cf parsePivotSteps() for more about the pivot object.
const buildThenExpandAnnotations = ({
                                      pangenomeImport,
                                      // pivotsImport,
                                      pivotPathName,
                                      pivotPathData,
                                      chromName
                                    }) => {

  const pivots = {};

  // ForEach pathName x pathData...
  Object.entries(pangenomeImport.paths).forEach(([comparedPathName, comparedPathData]) => {

    const innerLoopResult = parsePivotSteps({
      chromName,
      pangenomeImport,
      // pivotsImport,
      pivotPathName,
      pivotPathData,
      comparedPathName,
      comparedPathData
    });

    if (innerLoopResult && innerLoopResult.pivot) {

      // FILL PIVOTS DICT WITH ANNOTATIONS
      if (!pivots[pivotPathName]) {
        pivots[pivotPathName] = {};
      }
      if (!pivots[pivotPathName][comparedPathName]) {
        pivots[pivotPathName][comparedPathName] = {};
      }
      Object.assign(pivots[pivotPathName][comparedPathName], innerLoopResult.pivot);

      let trackAbsentPivotSteps = [];
      let lastPresentStepBeforeMissing;
      let firstPresentStepAfterMissing;

      // SECOND PASS  for (trailing) DELETION / SWAP DETECTION
      innerLoopResult.pivot.array.forEach((annotPivotStep, pivotStepIndex) => {

        // REMARK: Could we do this outside of this loop? Within the innerLoop instead, once everything is parsed?
        if (pivotStepIndex === innerLoopResult.pivot.array.length - 1 && annotPivotStep.comparedPathStepIndex === undefined) {
          // Detect if at the end of the array and there's still a swap or delete leftover
          // (Doing this because the rest of the process expects another "present" step to close the swap or gap)
          trackAbsentPivotSteps.push(annotPivotStep);
          // firstPresentStepAfterMissing = pivotStepIndex;
        }

        if (annotPivotStep.comparedPathStepIndex !== undefined || pivotStepIndex === innerLoopResult.pivot.array.length - 1) {

          if (trackAbsentPivotSteps.length === 0) {
            lastPresentStepBeforeMissing = annotPivotStep;

            // If there is 1+ absent pivot step...
          } else {
            firstPresentStepAfterMissing = annotPivotStep;

            // Without any gap opening...
            if (!lastPresentStepBeforeMissing) {
              // Do nothing, this is dangling at the front of the path
              // debugger;
              lastPresentStepBeforeMissing = annotPivotStep;
              firstPresentStepAfterMissing = null;
              trackAbsentPivotSteps = [];

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

                const swapOrDelete = trackAbsentPivotSteps[0].swapOrDelete;
                const swapOrDeleteNodes = trackAbsentPivotSteps[0].swapOrDeleteNodes;
                if (swapOrDelete && swapOrDeleteNodes) {
                  // Deletion not detected on initial pass
                  trackAbsentPivotSteps.forEach((missingStep) => {
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
                  trackAbsentPivotSteps = [];

                } else {
                  // Deletion detected on initial pass
                  lastPresentStepBeforeMissing = annotPivotStep;
                  firstPresentStepAfterMissing = null;
                  trackAbsentPivotSteps = [];
                }
              } else {
                // SECOND PASS SWAP

                if (trackAbsentPivotSteps[0].swapOrDelete && trackAbsentPivotSteps[0].swapOrDeleteNodes) {
                  // Swap not detected on initial pass
                  const swapOrDelete = trackAbsentPivotSteps[0].swapOrDelete;
                  const swapOrDeleteNodes = trackAbsentPivotSteps[0].swapOrDeleteNodes;
                  const swapComparedNodes = [];

                  for (let i = highestIndexBeforeGap + 1; i < lowestIndexAfterGap; i++) {
                    const step = comparedPathData[chromName][i];
                    const swapNode = {
                      comparedPathStepIndex: i,
                      comparedPathStepPanBlock: step.panBlock
                    };
                    swapComparedNodes.push(swapNode);
                  }

                  if (swapOrDelete && swapOrDeleteNodes) {
                    // Deletion not detected on initial pass
                    trackAbsentPivotSteps.forEach((missingStep) => {
                      missingStep.swap = missingStep.swapOrDelete || true;
                      missingStep.swapPivotNodes = missingStep.swapOrDeleteNodes || swapOrDeleteNodes;
                      missingStep.swapComparedNodes = swapComparedNodes;

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
                    trackAbsentPivotSteps = [];

                  } else {
                    // Swap detected on initial pass
                    // debugger;
                    annotPivotStep.swapComparedNodes = swapComparedNodes;
                    lastPresentStepBeforeMissing = annotPivotStep;
                    firstPresentStepAfterMissing = null;
                    trackAbsentPivotSteps = [];
                  }
                }
              }
            }
          }
        } else {
          trackAbsentPivotSteps.push(annotPivotStep);
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
                           chromName,
                           pangenomeImport,
                           // pivotsImport,
                           pivotPathName,
                           pivotPathData,
                           comparedPathName,
                           comparedPathData
                         }) => {


  // Applied only to compared paths
  // REMARK: Users might want to run it on the pivot too, to see coocs within pivot
  // Let's comment it for now? for performance it could be a special case
  // where only coocs are targetted, there would not be any other SV detected anyway.
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

  // Parsing the pivot data
  pivotPathData[chromName].forEach((pivotStep, pivotStepIndex) => {

    // 'stepResult' == multiple SV annotated objects, reusable within the loop
    const stepResult = annotatePivotStep({
      chromName,
      comparedPathName,
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

    // REMARK: Seems redundant, why have multiple copies of annotPivotStep? Ain't it heavy?
    // Could we just have 'blocks', with array simply storing the panBlock IDs, so that index and annotPivotStep are still linked?
    // REMARK: SV on previous annotPivotSteps (ex info on end of Swap, continuity of inversionChain...) are cascaded within buildThenExpandAnnotations(), through yet another loop
    pivot.array.push(annotPivotStep);
    pivot.blocks[annotPivotStep.panBlock] = annotPivotStep;
  });

  // console.log('pivotPathName', pivotPathName, 'comparedPathName', comparedPathName);
  // console.log('pivot', pivot);
  // debugger;

  return { pivot };

};

//---------------- Checks SV at a pivot step
// It looks for all SVs of annotateComparisonOfTwoSteps(), and looks for Swaps
//                  or annotatePresenceInsertionAndInversion()
// or DELETIONS
// Returns an object containing the updated annotPivotStep, the previous annotPivotStep,
// the latest Absent or latest Present annotPivotStep, and the first and last Swapped
// annotPivotStep, which could be objects or null
const annotatePivotStep = ({
                             // pivot,
                             chromName,
                             comparedPathName,
                             //comparedPathData,
                             pangenomeImport,
                             pivotStep,
                             pivotStepIndex,
                             previousPivotStep,
                             lastPresentPivotStep,
                             lastAbsentPivotStep,
                             lastSwappedPivotStep,
                             firstSwappedPivotStep
                           }) => {

  // Node object, traversed by the current pivot step
  const targetNodeOfPivotStep = pangenomeImport.panSkeleton[pivotStep.panBlock];

  // Stores node ID + step index
  const annotPivotStep = {
    panBlock: pivotStep.panBlock,
    pivotStepIndex: pivotStepIndex
  };

  // Increments annotPivotStep with found SVs (Coocs)
  annotateCoocs({
    pangenomeImport,
    annotPivotStep,
    comparedPathName,
    pivotStep,
    targetNodeOfPivotStep
  });
  // Increments annotPivotStep with found SVs (Presence, Insertion, Inversion, InversionChain)
  annotatePresenceInsertionAndInversion({
    pangenomeImport,
    chromName,
    annotPivotStep,
    comparedPathName,
    previousPivotStep,
    pivotStep,
    targetNodeOfPivotStep
  });

  //FORMER VERSION
  /*
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
  */

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
      // REMARK: Swaps at the very beginning might be ignored as such, as it asks for an absence after a presence here.
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
          firstSwappedPivotStep.swapOrDeleteNodes.push(swapNode); // REMARK: Cascaded on lastSwappedPivotStep.swapOrDeleteNodes within buildThenExpandAnnotations()?
        } else {
          lastSwappedPivotStep.swapOrDelete = "solo";
        }

        // console.log('lastPresentPivotStep', lastPresentPivotStep && lastPresentPivotStep.comparedPathStepIndex, 'annotPivotStep', annotPivotStep.comparedPathStepIndex);

        // There was no gap in the compared path, so it was merely a deletion (not a swap)
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
    // QUESTION: isn't the lastSwappedPivotStep always nullified with the current code?
    lastSwappedPivotStep,
    firstSwappedPivotStep
  };

};

//---------------- Checks local SV for a given pivot Step
// It looks for PRESENCE and potential INSERTION, INVERSION, or INVERSION CHAIN
// of a pivot Step compared with a path (named comparedPathName).
// Writes into annotPivotStep the following properties, when found:
//    present
//    comparedPathStepIndex
//    insertion
//    inversion
//    inversionChain
// and the related nodes ({index and ID in pivot, index and ID in compared, (highestComparedStepIndex)})
// Returns nothing, all modifications are directly applied to annotPivotStep.
const annotatePresenceInsertionAndInversion = ({
                                                 pangenomeImport,
                                                 chromName,
                                                 annotPivotStep,
                                                 comparedPathName,
                                                 previousPivotStep,
                                                 pivotStep,
                                                 targetNodeOfPivotStep
                                               }) => {

  // Index of previous pivot Step/Node in the compared path, or highest for Inv. Chains
  let highestComparedStepIndex = undefined;

  // PRESENCE ------------------------------------------------------------------
  let comparedPathStepIndex = targetNodeOfPivotStep.traversals[comparedPathName]?.[chromName];
  let nodeIsPresent = (comparedPathStepIndex !== undefined);
  // ---------------------------------------------------------------------------

  if (nodeIsPresent) {

    // Write annotation for PRESENCE
    annotPivotStep.present = true;
    annotPivotStep.comparedPathStepIndex = comparedPathStepIndex;

    let comparedPathStep = pangenomeImport.paths[comparedPathName][chromName][comparedPathStepIndex];

    // Check for SVs: INSERTION, INVERSION, INVERSION CHAIN --------------------
    let hasInsertion;
    let hasInversion;
    let hasInversionChain;

    hasInversion = (pivotStep.strand !== comparedPathStep.strand);

    // If there is a previous Step in the pivot...
    if (previousPivotStep) {

      highestComparedStepIndex = previousPivotStep.comparedPathStepIndex;
      if (previousPivotStep && previousPivotStep.inversionChain) {
        // REMARK: highestComparedStepIndex is supposed to be the same through all Steps of an invChain, why check this?
        // It is even non-existent in all Steps but the starting one, so the max would always be the same!
        previousPivotStep.inversionChainNodes.forEach(step => highestComparedStepIndex = Math.max(highestComparedStepIndex, step.comparedPathStepIndex));
      }

      hasInsertion = (highestComparedStepIndex < comparedPathStepIndex - 1);
      // Check the comparison step indices, if the previous one is higher than this one,
      // they're decrementing as the pivot steps increment and probably an inversion chain
      // REMARK: We could just check previousPivotStep.comparedPathStepIndex, I think:
      //hasInversionChain = (previousPivotStep.comparedPathStepIndex === comparedPathStepIndex + 1);
      hasInversionChain = (highestComparedStepIndex === comparedPathStepIndex + 1 || previousPivotStep.comparedPathStepIndex === comparedPathStepIndex + 1);
    }
    // -------------------------------------------------------------------------

    // Write annotation for INSERTION
    if (hasInsertion) {

      annotPivotStep.insertion = true;
      annotPivotStep.insertionNodes = [];

      for (let insertionPathStepsIndex = highestComparedStepIndex + 1;
           insertionPathStepsIndex < annotPivotStep.comparedPathStepIndex;
           insertionPathStepsIndex++) {
        const insertionPathStep = pangenomeImport.paths[comparedPathName][chromName][insertionPathStepsIndex];

        const insertionNode = {
          // REMARK: again, info on pivotStep is redundant. TODO: Remove it from this ppty.
          pivotStepIndex: annotPivotStep.pivotStepIndex,
          pivotStepPanBlock: pivotStep.panBlock,
          comparedPathStepIndex: insertionPathStepsIndex,
          comparedPathStepPanBlock: insertionPathStep.panBlock
        };
        annotPivotStep.insertionNodes.push(insertionNode);
      }
    }

    // Write annotation for INVERSION
    if (hasInversion) {

      annotPivotStep.inversion = true;
      if (!annotPivotStep.inversionNodes) {
        annotPivotStep.inversionNodes = [];
      }
      const inversionNode = {
        pivotStepIndex: annotPivotStep.pivotStepIndex,
        pivotStepPanBlock: pivotStep.panBlock,
        // REMARK: already stored for the "present" status, why write it here?
        comparedPathStepIndex: comparedPathStepIndex,
        // REMARK: supposed to be the same as pivot, why write it?
        comparedPathStepPanBlock: comparedPathStep.panBlock
      };
      annotPivotStep.inversionNodes.push(inversionNode);
    }

    // Write annotation for INVERSION CHAIN
    if (hasInversionChain) {

      // QUESTION: is it automatically updated with each new node within, for all that are already stored?
      // Or is it within buildThenExpandAnnotations()? if at all?
      const inversionChainNodes = previousPivotStep.inversionChainNodes || [];

      previousPivotStep.inversionChainNodes = inversionChainNodes;
      annotPivotStep.inversionChainNodes = inversionChainNodes;

      // Current step is inside an inversion chain
      annotPivotStep.inversionChain = true;

      if (!previousPivotStep.inversionChain) {
        // Previous step was the start of this inversion chain and must be updated accordingly
        previousPivotStep.inversionChain = "start";

        const inversionChainNode = {
          pivotStepIndex: previousPivotStep.pivotStepIndex,
          pivotStepPanBlock: previousPivotStep.panBlock,
          comparedPathStepIndex: previousPivotStep.comparedPathStepIndex,
          highestComparedStepIndex,
          comparedPathStepPanBlock: previousPivotStep.panBlock
        };
        inversionChainNodes.push(inversionChainNode);

      } else {
        // REMARK: Seems redundant, previousPivotStep.inversionChain === true is already implied by the loop
        // TODO: correct
        // Last step was inside an inversion chain
        previousPivotStep.inversionChain = true;
      }

      const inversionChainNode = {
        pivotStepIndex: annotPivotStep.pivotStepIndex,
        pivotStepPanBlock: pivotStep.panBlock,
        comparedPathStepIndex: comparedPathStepIndex,
        comparedPathStepPanBlock: comparedPathStep.panBlock
      };

      // QUESTION: Does the push at the end of the loop does anything?
      // How is the previousPivotStep.inversionChainNodes updated?
      // TODO: correct logic.
      inversionChainNodes.push(inversionChainNode);

    }

    // QUESTION: What if the final step is within an inv Chain?, no 'end' attributed? Done within buildThenExpandAnnotations()?
    // END OF INVERSION CHAIN
    // Current step is after (outside) an inversion chain, previous step was the last one within the inversion chain
    let isInversionChainNoMore = (previousPivotStep?.inversionChain && !annotPivotStep.inversionChain);
    if (isInversionChainNoMore) {
      previousPivotStep.inversionChain = "end";
    }

  }
};

//---------------- Checks coocs for a given pivot Step
// It looks for COOCCURRENCES of a pivot Step compared with a path (named
// comparedPathName).
// Writes into annotPivotStep the cooc property, and the related nodes
// ({index and ID in pivot, index and ID in compared})
// Returns nothing, all modifications are directly applied to annotPivotStep.
const annotateCoocs = ({
                         pangenomeImport,
                         annotPivotStep,
                         comparedPathName,
                         pivotStep,
                         targetNodeOfPivotStep
                       }) => {

  targetNodeOfPivotStep.coocs.forEach(panBlockID => {

    // Check for COOCCURRENCES -------------------------------------------------
    let targetNodeOfCooc = pangenomeImport.panSkeleton[panBlockID];
    let comparedPathHasCooc = (comparedPathName in targetNodeOfCooc.traversals);
    // -------------------------------------------------------------------------

    if (comparedPathHasCooc) {

      annotPivotStep.cooc = true;

      if (!annotPivotStep.coocNodes) {
        annotPivotStep.coocNodes = [];
      }
      for (let coocChromName in targetNodeOfCooc.traversals[comparedPathName]) {
        //targetNodeOfCooc.traversals[comparedPathName].forEach( (coocIndex, coocChromName) => {
        // Stores found cooc
        let coocIndex = targetNodeOfCooc.traversals[comparedPathName][coocChromName];
        const coocNode = {
          // REMARK: pivotStepIndex and pivotStepPanBlock are already written on creation of annotPivotStep
          // -> TODO: simplify objects by keeping only the first pivotStepIndex without rewriting it for every SV
          pivotStepIndex: annotatePivotStep.pivotStepIndex,
          pivotStepPanBlock: pivotStep.panBlock,
          comparedPathChromName: coocChromName, // TODO: include this info within the detail view
          comparedPathStepIndex: coocIndex,
          comparedPathStepPanBlock: panBlockID
        };
        annotPivotStep.coocNodes.push(coocNode);
      }

    }
  });
};

// DEPRECATED ---------------- Checks local SV between pivot and path Steps
// It compares current annotPivotStep with any comparedStep (and the direct previous steps)
// Writes coocs, present, comparedPathStepIndex, inversion, !deletion!, insertion, inversionChain
// and the related nodes ({index and ID in pivot, index and ID in compared, (highestComparedStepIndex)})
// into annotPivotStep as properties of an object.
// Returns an object containing the studied comparedStep
/*
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

  // Index of previous pivot Step/Node in the compared path, or highest for Inv. Chains
  let highestComparedStepIndex = previousPivotStep ? previousPivotStep.comparedPathStepIndex : undefined;
  if (previousPivotStep && previousPivotStep.inversionChain) {
    // REMARK: highestComparedStepIndex is supposed to be the same through all Steps of an invChain, why check this?
    // It is even non-existent in all Steps but the starting one, so the max would always be the same!
    previousPivotStep.inversionChainNodes.forEach(step => highestComparedStepIndex = Math.max(highestComparedStepIndex, step.comparedPathStepIndex));
  }

  // Checks if the current compared Step is a cooc of the current pivot Step
  // COOCCURRENCES ("COOCS")
  if (traversedPanBlock.coocs.includes(comparedPathStep.panBlock)) {
    annotPivotStep.cooc = true;
    if (!annotPivotStep.coocNodes) {
      annotPivotStep.coocNodes = [];
    }

    // Stores found cooc
    const coocNode = {
      // REMARK: pivotStepIndex and pivotStepPanBlock are already written on creation of annotPivotStep
      // -> TODO: simplify objects by keeping only the first pivotStepIndex without rewriting it for every SV
      pivotStepIndex: pivotStepIndex,
      pivotStepPanBlock: pivotStep.panBlock,
      comparedPathStepIndex: comparedPathStepIndex,
      comparedPathStepPanBlock: comparedPathStep.panBlock
    };
    annotPivotStep.coocNodes.push(coocNode);
  }

  // PRESENCE, then INVERSION, INSERTION, or INVERSION CHAIN
  if (pivotStep.panBlock === comparedPathStep.panBlock) {

    // TODO: Directly check and fetch the index thanks to the data format: panSkeleton[panBlock_ID]['traversals'][compared_ID][chromName]
    // as looping through all compared Steps only to find the matching one is unecessary
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
    // REMARK: supposed to be the same as pivot, why write it?
        comparedPathStepPanBlock: comparedPathStep.panBlock
      };
      annotPivotStep.inversionNodes.push(inversionNode);
    }

    // If there is a previous Step in the pivot...
    if (previousPivotStep) {

      // DELETION
      // CAUTION: Not working, as all pivot steps are parsed in consecutive order
      // Condition below can never be met
      if (previousPivotStep.pivotStepIndex < annotPivotStep.pivotStepIndex - 1) {
        // Don't think I can detect deletion here
        annotPivotStep.deletion = true;
      }

      // INSERTION
      // QUESTION: What happens if highestComparedStepIndex is undefined (eg. absent from previous annotPivotStep)?
      if (highestComparedStepIndex < annotPivotStep.comparedPathStepIndex - 1) {
        annotPivotStep.insertion = true;
        annotPivotStep.insertionNodes = [];

        for (let insertionPathStepsIndex = highestComparedStepIndex + 1;
          insertionPathStepsIndex < annotPivotStep.comparedPathStepIndex;
          insertionPathStepsIndex++) {
          const insertionPathStep = comparedPathData[chromName][insertionPathStepsIndex];

          const insertionNode = {
            // REMARK: again, info on pivotStep is redundant. TODO: Remove it from this ppty.
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
      // REMARK: We could just check previousPivotStep.comparedPathStepIndex, I think:
      //if (previousPivotStep.comparedPathStepIndex === annotPivotStep.comparedPathStepIndex + 1) {
      if (highestComparedStepIndex === annotPivotStep.comparedPathStepIndex + 1 || previousPivotStep.comparedPathStepIndex === annotPivotStep.comparedPathStepIndex + 1) {

        // QUESTION: is it automatically updated with each new node within, for all that are already stored?
        // Or is it within buildThenExpandAnnotations()? if at all?
        const inversionChainNodes = previousPivotStep.inversionChainNodes || [];

        previousPivotStep.inversionChainNodes = inversionChainNodes;
        annotPivotStep.inversionChainNodes = inversionChainNodes;

        // Current step is inside an inversion chain
        // annotPivotStep.inversionChain = annotPivotStep.inversionChain || "";
        annotPivotStep.inversionChain = true;

        // Checking if the current node is part of inv chain seems redundant as it is stated just before
        if (annotPivotStep.inversionChain && !previousPivotStep.inversionChain) {
          // Last step was the start of this inversion chain
          previousPivotStep.inversionChain = "start";

          const inversionChainNode = {
            pivotStepIndex: previousPivotStep.pivotStepIndex,
            pivotStepPanBlock: previousPivotStep.panBlock,
            comparedPathStepIndex: previousPivotStep.comparedPathStepIndex,
            highestComparedStepIndex,
            comparedPathStepPanBlock: previousPivotStep.panBlock
          };
          inversionChainNodes.push(inversionChainNode);

        } else {
          // REMARK: Seems redundant, previousPivotStep.inversionChain === true is already implied by the loop
          // TODO: correct
          // Last step was inside an inversion chain
          previousPivotStep.inversionChain = true;
        }

        const inversionChainNode = {
          pivotStepIndex: pivotStepIndex,
          pivotStepPanBlock: pivotStep.panBlock,
          comparedPathStepIndex: comparedPathStepIndex,
          comparedPathStepPanBlock: comparedPathStep.panBlock
        };

        // QUESTION: Does the push at the end of the loop does anything?
        // How is the previousPivotStep.inversionChainNodes updated?
        // TODO: correct logic.
        inversionChainNodes.push(inversionChainNode);

      }

      // END OF INVERSION CHAIN
      // QUESTION: What if the final step is within an inv Chain?, no 'end' attributed? Done within buildThenExpandAnnotations()?
      if (previousPivotStep.inversionChain && !annotPivotStep.inversionChain) {
        // Current step is after (outside) an inversion chain, previous step was last inside the inversion chain
        previousPivotStep.inversionChain = "end";
      }
    }

  }

  previousComparedPathStep = comparedPathStep;

  return { previousComparedPathStep };
};
*/


const getDataInternal = async (chromToDisplay) => {

  if (dataCache?.pivots[chromToDisplay]) {
    return dataCache;
  }

  //let startMark = "Beginning";
  //let stopMark = "End";

  //performance.mark(startMark);

  let pangenomeImport = await import(
    // "../data/sample/handcrafted3AssembliesPangenome_withSequenceOrigin.json"
    "../data/real-data/pangenome__coordinate_SaVanache.json"
    );

  if (!chromNamesPerPath) {
    chromNamesPerPath = {};
    Object.entries(pangenomeImport.paths).forEach(([pathName, pathData]) => {
      chromNamesPerPath[pathName] = Object.getOwnPropertyNames(pathData);
    });
    console.log("chromNamesPerPath", chromNamesPerPath);
  }
  let firstAssembly = Object.keys(chromNamesPerPath)[0];
  let firstChromOfFirstAssembly = chromNamesPerPath[firstAssembly][0];
  let chromName = (chromToDisplay ? chromToDisplay : firstChromOfFirstAssembly);

  //const chromName = 'Gm01' // TODO: adapt it depending on user's choice within the app

  pangenomeImport = pangenomeImport.default || pangenomeImport;

  const pivotsPerChrom = {};
  //const pivots = {};
  Object.entries(pangenomeImport.paths).forEach(([pivotPathName, pivotPathData]) => {

    const outerLoopResult = buildThenExpandAnnotations({
      pangenomeImport,
      pivotPathName,
      pivotPathData,
      chromName
    });

    if (outerLoopResult && outerLoopResult.pivots) {
      Object.assign(pivotsPerChrom, outerLoopResult.pivots);
      //Object.assign(pivots, outerLoopResult.pivots);
    }

  });

  if (!pivots) {
    pivots = {};
  }
  pivots[chromName] = pivotsPerChrom;

  console.log("pivots", pivots);

  //performance.mark(stopMark);
  //performance.measure("Elapsed time for annotation", startMark, stopMark);
  //console.log(performance.getEntriesByType("measure"));

  //dataCache = { pangenome: pangenomeImport.default || pangenomeImport, pivots, chromName };
  dataCache = { pangenome: pangenomeImport.default || pangenomeImport, pivots, chromNamesPerPath };

  return dataCache;
};