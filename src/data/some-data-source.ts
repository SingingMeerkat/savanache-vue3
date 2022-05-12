// let dataCache: undefined | { pangenome: PangenomeJson; pivots: PivotJson };
//
// export const getData = async () => {
//   if (dataCache) {
//     return dataCache;
//   }
//   const { default: pangenome } = await import(
//     "../data/sample/handcrafted3AssembliesPangenome.json"
//   );
//   const { default: pivots } = await import("../data/sample/pivots.json");
//
//   if (pangenome && pivots) {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     dataCache = { pangenome, pivots };
//     return dataCache;
//   }
// };
//
// export const getListOfPaths = (data) => {
//   if (data && data.paths) {
//     return Object.keys(data.paths);
//   }
// };
//
// export const getAssemblyForPath = (path, data) => {
//   // panSkeleton should be panSkeleton but following json data spelling
//   if (path && path.steps && data && data.panSkeleton) {
//     const steps = path.steps;
//     const skeleton = path.steps.map((node) => ({
//       ...node,
//       ...data.panSkeleton[node.panBlock],
//     }));
//   }
// };
//
// const newRegion = (type) => ({
//   type,
//   pivotNodes: [],
//   pathNodes: [],
// });
//
// const doThing = (pivotName, pathName, data) => {
//   console.log("");
//   const panSkeleton = data.panSkeleton;
//   const pivot = data.paths[pivotName].steps;
//   const path = data.paths[pathName].steps;
//
//   console.log("Pivot Length", pivot.length);
//   console.log("Path Length", path.length);
//
//   const result = {
//     both: {
//       regions: [],
//     },
//     [pivotName]: {
//       regions: [],
//     },
//     [pathName]: {
//       regions: [],
//     },
//   };
//
//   const getCooccurenceFor = (pivotBlock, panBlock) => {
//     // if (/_\w_\d$/.test(panBlock)) {
//     //     debugger;
//     // }
//     const results = [];
//     const cooccurences = pivotBlock && pivotBlock.cooccurrences;
//     if (cooccurences) {
//       for (let i = 0; i < cooccurences.length; i++) {
//         const blockName = cooccurences[i];
//         const coBlock = panSkeleton[blockName];
//         const coTraversal = coBlock.traversals[pathName];
//         // if (/_\w_\d$/.test(panBlock)) {
//         //     debugger;
//         // }
//         if (coTraversal !== undefined) {
//           results.push(blockName);
//         }
//       }
//     }
//     return results;
//   };
//
//   const getPropsFor = (pivotIndex, pathIndex) => {
//     const pivotNode = pivot[pivotIndex]
//       ? { ...pivot[pivotIndex], pivotIndex }
//       : undefined;
//     const pivotPanBlock = pivotNode && pivotNode.panBlock;
//     const pivotBlock = pivotNode && panSkeleton[pivotPanBlock];
//     const pathIndexFromPivotBlock =
//       pivotBlock && pivotBlock.traversals[pathName];
//
//     const pathNode = path[pathIndex]
//       ? { ...path[pathIndex], pathIndex }
//       : undefined;
//     const pathPanBlock = pathNode && pathNode.panBlock;
//     const pathBlock = pathNode && panSkeleton[pathPanBlock];
//     const pivotIndexFromPathBlock =
//       pathBlock && pathBlock.traversals[pivotName];
//
//     const present =
//       pivotPanBlock && pathPanBlock && pivotPanBlock === pathPanBlock;
//     const inversion =
//       pivotNode && pathNode && pivotNode.strand !== pathNode.strand;
//
//     const cooccurrences =
//       pivotNode && getCooccurenceFor(pivotBlock, pivotPanBlock);
//
//     if (present) {
//       pivotNode.present = true;
//     } else {
//       pivotNode.absent = true;
//     }
//
//     if (present && inversion) {
//       pivotNode.inversion = true;
//     }
//
//     if (cooccurrences.length > 0) {
//       pivotNode.cooccurrence = true;
//     }
//
//     // debugger;
//
//     return {
//       pivotIndex,
//       pathIndex,
//
//       pivotNode,
//       pivotPanBlock,
//       pivotBlock,
//       pathIndexFromPivotBlock,
//
//       pathNode,
//       pathPanBlock,
//       pathBlock,
//       pivotIndexFromPathBlock,
//
//       present,
//       inversion,
//       cooccurrences,
//     };
//   };
//
//   // const list = [];
//   const nodes = {};
//   const types = {};
//   const regions = [];
//   let region;
//   let pathIndex = 0;
//
//   const checkUpdateRegion = (region, type) => {
//     if (!region || region.type !== type) {
//       // if (region) {
//       //     regions.push(region);
//       // }
//       region = newRegion(type);
//       regions.push(region);
//     }
//     return region;
//   };
//
//   const pushKey = (pivotNode, type, data) => {
//     if (!nodes[pivotNode]) {
//       nodes[pivotNode] = {};
//     }
//     if (!nodes[pivotNode][type]) {
//       nodes[pivotNode][type] = [];
//     }
//     if (
//       !nodes[pivotNode][type].find(
//         (p) => JSON.stringify(p) === JSON.stringify(data)
//       )
//     ) {
//       nodes[pivotNode][type].push(data);
//     }
//
//     if (!types[type]) {
//       types[type] = {};
//     }
//     if (!types[type][pivotNode]) {
//       types[type][pivotNode] = [];
//     }
//     if (
//       !types[type][pivotNode].find(
//         (p) => JSON.stringify(p) === JSON.stringify(data)
//       )
//     ) {
//       types[type][pivotNode].push(data);
//     }
//   };
//
//   for (let pivotIndex = 0; pivotIndex < pivot.length; pivotIndex++) {
//     const current = getPropsFor(pivotIndex, pathIndex);
//
//     const params = [
//       "[Pivot Index]:",
//       pivotIndex,
//       "[Path Index]:",
//       pathIndex,
//
//       "[Pivot Index From Path Block]:",
//       current.pivotIndexFromPathBlock,
//       "[Path Index From Pivot Block]:",
//       current.pathIndexFromPivotBlock,
//
//       "[Pivot Block]:",
//       current.pivotNode && current.pivotPanBlock,
//       "[Path Block]:",
//       current.pathNode && current.pathPanBlock,
//     ];
//
//     if (current.present && !current.inversion) {
//       const type = "present";
//
//       // if (current.cooccurrences.length > 0) {
//       //     type += '/cooccurrence';
//       // }
//
//       region = checkUpdateRegion(region, type);
//       region.pivotNodes.push(current.pivotNode);
//       region.pathNodes.push(current.pathNode);
//
//       pushKey(current.pivotPanBlock, type, {
//         pathNode: current.pathPanBlock,
//         pivotIndex,
//         pathIndex,
//       });
//
//       params.push("[Match]");
//       pathIndex++;
//     } else if (current.present && current.inversion) {
//       let type = "present/inversion";
//
//       const testForwardPivot = [];
//       const testForwardPath = [];
//
//       const testBackwardPivot = [];
//       const testBackwardPath = [];
//
//       // debugger;
//       // 10 is an arbitrary number to limit the search
//       for (let i = 0; i < 10; i++) {
//         const test = getPropsFor(pivotIndex + i, pathIndex - i);
//         if (test.pivotPanBlock === test.pathPanBlock) {
//           testForwardPivot.push(test.pivotNode);
//           testForwardPath.push(test.pathNode);
//         } else {
//           break;
//         }
//       }
//
//       for (let i = 0; i < 10; i++) {
//         const test = getPropsFor(pivotIndex - i, pathIndex + i);
//         if (test.pivotPanBlock === test.pathPanBlock) {
//           testBackwardPivot.push(test.pivotNode);
//           testBackwardPath.push(test.pathNode);
//         } else {
//           break;
//         }
//       }
//
//       if (testForwardPivot.length > 1) {
//         debugger;
//
//         // Inversion chain! (probably?)
//         type += "/chain/forward";
//
//         region = checkUpdateRegion(region, type);
//         for (let i = 0; i < testForwardPivot.length; i++) {
//           region.pivotNodes.push(testForwardPivot[i]);
//           region.pathNodes.push(testForwardPath[i]);
//
//           pushKey(testForwardPivot[i].panBlock, type, {
//             pathNode: testForwardPath[i].panBlock,
//             pivotIndex,
//             pathIndex,
//           });
//         }
//
//         params.push("[Inversion Chain]");
//         pivotIndex += testForwardPivot.length - 1;
//         pathIndex++;
//       } else if (testBackwardPivot.length > 1) {
//         debugger;
//
//         // Inversion chain! (probably?)
//         type += "/chain/backward";
//
//         region = checkUpdateRegion(region, type);
//         for (let i = 0; i < testBackwardPivot.length; i++) {
//           region.pivotNodes.push(testBackwardPivot[i]);
//           region.pathNodes.push(testBackwardPath[i]);
//
//           pushKey(testBackwardPivot[i].panBlock, type, {
//             pathNode: testBackwardPath[i].panBlock,
//             pivotIndex,
//             pathIndex,
//           });
//         }
//
//         params.push("[Inversion Chain]");
//         // pivotIndex += testBackwardPivot.length - 2;
//         pathIndex += testBackwardPivot.length;
//       } else {
//         region = checkUpdateRegion(region, type);
//         region.pivotNodes.push(current.pivotNode);
//         region.pathNodes.push(current.pathNode);
//
//         pushKey(current.pivotPanBlock, type, {
//           pathNode: current.pathPanBlock,
//           pivotIndex,
//           pathIndex,
//         });
//
//         params.push("[Inversion]");
//         pathIndex++;
//       }
//
//       // } else if (current.pathIndexFromPivotBlock === undefined && current.pivotIndexFromPathBlock === undefined) {
//       //     region = checkUpdateRegion(region, 'swap');
//       //     region.pivotNodes.push(current.pivotNode);
//       //     region.pathNodes.push(current.pathNode);
//       //     params.push('[Swap]');
//       //     pathIndex++;
//     } else {
//       let type = "disruption";
//
//       params.push("[Disruption]");
//       // The path has diverged, let's figure out why
//       // const next = getPropsFor(pivotIndex + 1, pathIndex + 1);
//
//       // if (current.pathIndexFromPivotBlock === undefined || current.pivotIndexFromPathBlock === undefined) {
//       // Pivot block doesn't exist in path, but path block exists in pivot
//       // It's an absence
//       // region = checkUpdateRegion(region, 'absence');
//       // region.pivotNodes.push(current.pivotNode);
//
//       const trackedPivotBlocks = [];
//       const trackedPathBlocks = [];
//       let foundPathBlockIndexInPivot;
//       let foundPivotBlockIndexInPath;
//       let matchedPathBlockInPivot;
//       let matchedPivotBlockInPath;
//
//       // Find next common node/block
//       for (let i = 0; i < pivot.length - pivotIndex; i++) {
//         const searchAhead = getPropsFor(pivotIndex + i, pathIndex + i);
//         // This can help find inversions but it breaks all the other disruptions
//         // trackedPivotBlocks.push(searchAhead.pivotPanBlock + (searchAhead.pivotNode ? searchAhead.pivotNode.strand : ''));
//         // trackedPathBlocks.push(searchAhead.pathPanBlock + (searchAhead.pathNode ? searchAhead.pathNode.strand : ''));
//
//         trackedPivotBlocks.push(searchAhead.pivotPanBlock);
//         trackedPathBlocks.push(searchAhead.pathPanBlock);
//
//         // Search for a path block in the pivot blocks
//         for (
//           let pathSearchIndex = 0;
//           pathSearchIndex < trackedPivotBlocks.length;
//           pathSearchIndex++
//         ) {
//           const foundPathBlockIndexInTrackedPivotBlocks =
//             trackedPivotBlocks.indexOf(trackedPathBlocks[pathSearchIndex]);
//           // const foundPathIndex = foundPathBlockIndexInTrackedPivotBlocks > -1 ? foundPathBlockIndexInTrackedPivotBlocks + pathIndex : -1;
//           const foundPathIndex =
//             foundPathBlockIndexInTrackedPivotBlocks > -1
//               ? foundPathBlockIndexInTrackedPivotBlocks + pivotIndex
//               : -1;
//           if (
//             foundPathIndex > -1 &&
//             (foundPathIndex < foundPathBlockIndexInPivot ||
//               foundPathBlockIndexInPivot === undefined)
//           ) {
//             foundPathBlockIndexInPivot = foundPathIndex;
//             matchedPathBlockInPivot =
//               trackedPivotBlocks[foundPathBlockIndexInTrackedPivotBlocks];
//             // debugger;
//           }
//         }
//
//         // Search for a pivot block in the path blocks
//         for (
//           let pivotSearchIndex = 0;
//           pivotSearchIndex < trackedPathBlocks.length;
//           pivotSearchIndex++
//         ) {
//           const foundPivotBlockIndexInTrackedPathBlocks =
//             trackedPathBlocks.indexOf(trackedPivotBlocks[pivotSearchIndex]);
//           // const foundPivotIndex = foundPivotBlockIndexInTrackedPathBlocks > -1 ? foundPivotBlockIndexInTrackedPathBlocks + pivotIndex : -1;
//           const foundPivotIndex =
//             foundPivotBlockIndexInTrackedPathBlocks > -1
//               ? foundPivotBlockIndexInTrackedPathBlocks + pathIndex
//               : -1;
//           if (
//             foundPivotIndex > -1 &&
//             (foundPivotIndex < foundPivotBlockIndexInPath ||
//               foundPivotBlockIndexInPath === undefined)
//           ) {
//             foundPivotBlockIndexInPath = foundPivotIndex;
//             matchedPivotBlockInPath =
//               trackedPathBlocks[foundPivotBlockIndexInTrackedPathBlocks];
//             // debugger;
//           }
//         }
//
//         if (
//           foundPathBlockIndexInPivot !== undefined &&
//           foundPivotBlockIndexInPath !== undefined
//         ) {
//           // debugger;
//           break;
//         }
//       }
//
//       debugger;
//
//       // If path is longer than pivot
//       if (
//         foundPathBlockIndexInPivot !== undefined &&
//         foundPivotBlockIndexInPath !== undefined
//       ) {
//         // foundPivotBlockIndexInPath > pathIndex &&
//         if (
//           foundPivotBlockIndexInPath > pathIndex &&
//           foundPathBlockIndexInPivot > pivotIndex
//         ) {
//           // debugger;
//           type += "/absent/swap";
//
//           // if (current.cooccurrences.length > 0) {
//           //     type += '/cooccurrence';
//           // }
//
//           region = checkUpdateRegion(region, type);
//           params.push("[Swap]");
//           for (let i = pivotIndex; i < foundPathBlockIndexInPivot; i++) {
//             const gap = getPropsFor(i, pathIndex);
//             region.pivotNodes.push(gap.pivotNode);
//
//             pushKey(gap.pivotPanBlock, type, {
//               pathNode: current.pathPanBlock,
//               pivotIndex: i,
//               pathIndex,
//             });
//           }
//           for (let i = pathIndex; i < foundPivotBlockIndexInPath; i++) {
//             const gap = getPropsFor(pivotIndex, i);
//             region.pathNodes.push(gap.pathNode);
//
//             pushKey(current.pivotPanBlock, type, {
//               pathNode: gap.pathPanBlock,
//               pivotIndex,
//               pathIndex: i,
//             });
//           }
//           // debugger;
//           pathIndex = foundPivotBlockIndexInPath;
//           pivotIndex = foundPathBlockIndexInPivot;
//           // pathIndex--;
//           pivotIndex--;
//           // debugger;
//         } else if (
//           foundPivotBlockIndexInPath > pathIndex &&
//           foundPathBlockIndexInPivot === pivotIndex
//         ) {
//           // debugger;
//           type += "/insertion";
//
//           // if (current.cooccurrences.length > 0) {
//           //     type += '/cooccurrence';
//           // }
//
//           region = checkUpdateRegion(region, type);
//           params.push("[Insertion]");
//           for (let i = pivotIndex; i <= foundPathBlockIndexInPivot; i++) {
//             const gap = getPropsFor(i, pathIndex);
//             region.pivotNodes.push(gap.pivotNode);
//
//             pushKey(gap.pivotPanBlock, type, {
//               pathNode: current.pathPanBlock,
//               pivotIndex: i,
//               pathIndex,
//             });
//           }
//           for (let i = pathIndex; i < foundPivotBlockIndexInPath; i++) {
//             const gap = getPropsFor(pivotIndex, i);
//             region.pathNodes.push(gap.pathNode);
//
//             pushKey(current.pivotPanBlock, type, {
//               pathNode: gap.pathPanBlock,
//               pivotIndex,
//               pathIndex: i,
//             });
//           }
//           // debugger;
//           pathIndex = foundPivotBlockIndexInPath;
//           pivotIndex = foundPathBlockIndexInPivot;
//           // pathIndex--;
//           pivotIndex--;
//           // debugger;
//         } else if (
//           foundPivotBlockIndexInPath === pathIndex &&
//           foundPathBlockIndexInPivot > pivotIndex
//         ) {
//           // debugger;
//           type += "/absent/deletion";
//
//           // if (current.cooccurrences.length > 0) {
//           //     type += '/cooccurrence';
//           // }
//
//           region = checkUpdateRegion(region, type);
//           params.push("[Deletion]");
//           for (let i = pivotIndex; i < foundPathBlockIndexInPivot; i++) {
//             const gap = getPropsFor(i, pathIndex);
//             region.pivotNodes.push(gap.pivotNode);
//
//             pushKey(gap.pivotPanBlock, type, {
//               pathNode: current.pathPanBlock,
//               pivotIndex: i,
//               pathIndex,
//             });
//           }
//           for (let i = pathIndex; i < foundPivotBlockIndexInPath; i++) {
//             const gap = getPropsFor(pivotIndex, i);
//             region.pathNodes.push(gap.pathNode);
//
//             pushKey(current.pivotPanBlock, type, {
//               pathNode: gap.pathPanBlock,
//               pivotIndex,
//               pathIndex: i,
//             });
//           }
//           // debugger;
//           pathIndex = foundPivotBlockIndexInPath;
//           pivotIndex = foundPathBlockIndexInPivot;
//           // pathIndex--;
//           pivotIndex--;
//           // debugger;
//         } else if (
//           foundPivotBlockIndexInPath === pathIndex &&
//           foundPathBlockIndexInPivot === pivotIndex
//         ) {
//           // Path 0 (pivot) to Path 2 comparison, 100 and 101 are swapped (100->101, 101->100)
//           // debugger;
//           type += "/translocation";
//
//           // if (current.cooccurrences.length > 0) {
//           //     type += '/cooccurrence';
//           // }
//
//           region = checkUpdateRegion(region, type);
//           params.push("[Translocation]");
//           for (let i = pivotIndex; i <= foundPathBlockIndexInPivot; i++) {
//             const gap = getPropsFor(i, pathIndex);
//             region.pivotNodes.push(gap.pivotNode);
//
//             pushKey(gap.pivotPanBlock, type, {
//               pathNode: current.pathPanBlock,
//               pivotIndex: i,
//               pathIndex,
//             });
//           }
//           for (let i = pathIndex; i <= foundPivotBlockIndexInPath; i++) {
//             const gap = getPropsFor(pivotIndex, i);
//             region.pathNodes.push(gap.pathNode);
//
//             pushKey(current.pivotPanBlock, type, {
//               pathNode: gap.pathPanBlock,
//               pivotIndex,
//               pathIndex: i,
//             });
//           }
//           pathIndex++;
//           // pivotIndex++;
//           // pathIndex += foundPivotBlockIndexInPath - pathIndex;
//         } else {
//           // what did I miss?
//           debugger;
//         }
//       } else {
//         debugger;
//
//         type += "/other";
//
//         // if (current.cooccurrences.length > 0) {
//         //     type += '/cooccurrence';
//         // }
//         // what else did I miss?
//         // Case 1: At end of pivot array and it's a swap
//         region = checkUpdateRegion(region, type);
//         region.pivotNodes.push(current.pivotNode);
//         region.pathNodes.push(current.pathNode);
//
//         pushKey(current.pivotPanBlock, type, {
//           pathNode: current.pathPanBlock,
//           pivotIndex,
//           pathIndex,
//         });
//
//         params.push("[Swap]");
//         pathIndex++;
//         debugger;
//       }
//
//       // pathIndex++;
//     }
//     console.log(...params);
//   }
//   debugger;
//   console.log("");
//   console.log(JSON.stringify(regions));
//   console.log("");
//   console.log(JSON.stringify(nodes));
//   console.log("");
//   console.log(JSON.stringify(types));
//   console.log("");
//   return result;
// };
//
// const nodeIsInBothPaths = (node, pivotName, pathName, panSkeleton) => {
//   const block = panSkeleton[node.panBlock];
//   return (
//     block.traversals[pivotName] !== undefined &&
//     block.traversals[pathName] !== undefined
//   );
// };
//
// const isMatch = (pivotNode, pathNode) => {
//   return pivotNode.panBlock === pathNode.panBlock;
// };
//
// const isDeletion = (pivotName, pivotNode, pathName, pathNode, panSkeleton) => {
//   const pivotBlock = panSkeleton[pivotNode.panBlock];
//   const pathBlock = panSkeleton[pathNode.panBlock];
//   const pivotIndexInPathBlock = pathBlock.traversals[pivotName];
//   const pathIndexInPivotBlock = pivotBlock.traversals[pathName];
//
//   return (
//     pivotIndexInPathBlock !== undefined && pathIndexInPivotBlock === undefined
//   );
// };
//
// const isInsertion = (pivotName, pivotNode, pathName, pathNode, panSkeleton) => {
//   const pivotBlock = panSkeleton[pivotNode.panBlock];
//   const pathBlock = panSkeleton[pathNode.panBlock];
//   const pivotIndexInPathBlock = pathBlock.traversals[pivotName];
//   const pathIndexInPivotBlock = pivotBlock.traversals[pathName];
//
//   return (
//     pivotIndexInPathBlock === undefined && pathIndexInPivotBlock !== undefined
//   );
// };
//
// const isSwap = (pivotName, pivotNode, pathName, pathNode, panSkeleton) => {
//   const pivotBlock = panSkeleton[pivotNode.panBlock];
//   const pathBlock = panSkeleton[pathNode.panBlock];
//   const pivotIndexInPathBlock = pathBlock.traversals[pivotName];
//   const pathIndexInPivotBlock = pivotBlock.traversals[pathName];
//
//   return (
//     pivotIndexInPathBlock === undefined && pathIndexInPivotBlock === undefined
//   );
// };
//
// const isCooccurence = (
//   pivotName,
//   pivotNode,
//   pathName,
//   pathNode,
//   panSkeleton
// ) => {
//   const pivotBlock = panSkeleton[pivotNode.panBlock];
//   const pathBlock = panSkeleton[pathNode.panBlock];
//   const pivotIndexInPathBlock = pathBlock.traversals[pivotName];
//   const pathIndexInPivotBlock = pivotBlock.traversals[pathName];
//   // TODO
// };
//
// const isInversion = (pivotNode, pathNode) => {
//   return (
//     pivotNode.panBlock === pathNode.panBlock &&
//     pivotNode.strand !== pathNode.strand
//   );
// };
//
// const isInversionChain = () => {
//   // TODO
// };
//
// const isTranslocation = (
//   pivotName,
//   pivotNode,
//   pivotIndex,
//   pathName,
//   pathNode,
//   pathIndex,
//   panSkeleton
// ) => {
//   const pivotBlock = panSkeleton[pivotNode.panBlock];
//   const pathBlock = panSkeleton[pathNode.panBlock];
//   const pivotIndexInPathBlock = pathBlock.traversals[pivotName];
//   const pathIndexInPivotBlock = pivotBlock.traversals[pathName];
//   // TODO
//
//   return (
//     pivotIndexInPathBlock !== undefined && pathIndexInPivotBlock !== undefined
//   );
// };
//
// const getCooccurences = (node, panSkeleton) => {
//   const block = panSkeleton[node.panBlock];
//   if (block && block.cooccurrences) {
//     return block.cooccurrences.map((panBlock) => panSkeleton[panBlock]);
//   }
// };
//
// const testData = async () => {
//   const data = await getData();
//   const paths = getListOfPaths(data);
//   // debugger;
//   // const a = doThing('Ganymede', 'Aphrodite', data);
//   debugger;
//   const b = doThing("Ganymede", "Leonidas", data);
//   debugger;
// };
//
// // testData();
