<template>
  <div class="structural-variations-details">

    <div class="table-container">
      <v-card tile>


        <div v-if="selectedBlock.pivot && selectedBlock.assembly && selectedBlock.block"
             class="data-area d-flex flex-row">

          <!-- "Header" column -->
          <div class="data-labels col-2 d-flex flex-column pr-0 mr-n1 pt-5 pb-1">

            <div class="data-label elevation-1 px-3">
              {{ assemblyName }}
            </div>

            <div class="data-label elevation-1 px-3">
            </div>

            <div class="data-label elevation-1 px-3">
              {{ pivotName }}
            </div>

          </div>
          <!-- "Data" column rows -->
          <div class="data-block-rows col-10 d-flex flex-column pl-0 mr-1 pt-5 pb-1">

            <div class="data-block-row d-flex flex-row">
              <div :style="{ left: assemblyOffset+'px' }" class="block-wrapper">
                <div v-for="(assemblyStep, asIndex) in assemblySteps"
                     :key="`assembly-row-${assemblyName}-step-${assemblyStep.name}-${asIndex}`"
                     :class="['data-block-column', `block-${asIndex % 2}`, ...assemblyStep.blockClasses.map(style => `block-style-${style.toLowerCase()}`)]"
                     :style="assemblyStep.blockStyles"
                >
                  <div :class="[`assembly-block`, `block-type`, `block-type-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in assemblyStep.blockTypes" :key="`assembly-${assemblyName}-step-${assemblyStep.name}-block-type-text-${blockType}-${asIndex}-${btIndex}`">
                  </div>
                  <div class="block-label">
                    {{ assemblyStep.name }}
                  </div>
                  <div :class="[`assembly-block`, `block-text`, `block-type-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in assemblyStep.blockTypes" :key="`assembly-${assemblyName}-step-${assemblyStep.name}-block-type-${blockType}-${asIndex}-${btIndex}`">
                    [{{ blockType }}]
                  </div>
                </div>
              </div>
            </div>

            <div class="data-block-row d-flex flex-row">
              <div v-for="(visualStep, vsIndex) in visualSteps"
                   :key="`visual-row-step-${visualStep.name}-${vsIndex}`"
                   :class="['visual-block', 'data-block-column', `block-${vsIndex % 2}`, `elevation-1`, ...visualStep.blockClasses.map(style => `block-style-${style.toLowerCase()}`)]"
                   :style="visualStep.blockStyles"
              >
                <div :class="[`visual-block`, `block-type`, `block-type-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in visualStep.blockTypes" :key="`visual-step-${visualStep.name}-block-type-text-${blockType}-${vsIndex}-${btIndex}`">
                </div>
              </div>
            </div>

            <div class="data-block-row d-flex flex-row">
              <div :style="{ left: pivotOffset+'px' }" class="block-wrapper">
                <div v-for="(pivotStep, psIndex) in pivotSteps"
                     :key="`pivot-row-${pivotName}-step-${pivotStep.name}-${psIndex}`"
                     :class="['data-block-column', `block-${psIndex % 2}`, ...pivotStep.blockClasses.map(style => `block-style-${style.toLowerCase()}`)]"
                     :style="pivotStep.blockStyles"
                >
                  <div :class="[`pivot-block`, `block-type`, `block-type-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in pivotStep.blockTypes" :key="`pivot-${pivotName}-step-${pivotStep.name}-block-type-text-${blockType}-${psIndex}-${btIndex}`">
                  </div>
                  <div class="block-label">
                    {{ pivotStep.name }}
                  </div>
                  <div :class="[`pivot-block`, `block-text`, `block-type-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in pivotStep.blockTypes" :key="`pivot-${pivotName}-step-${pivotStep.name}-block-type-${blockType}-${psIndex}-${btIndex}`">
                    [{{ blockType }}]
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">

import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { PangenomeJson, PanNodes, Path, Paths } from "@/interfaces/pangenome-json";
import { PivotJson, PivotPathNode } from "@/interfaces/pivot-json";
import { reactiveVuex } from "@/store/helper";
import { SelectedAssemblies, SelectedBlock, SelectedPivot, SelectedSVs } from "@/store";
// import {selectedAssemblies, selectedChromosome, selectedPivot} from '@/data/some-data-source';

export default defineComponent({
  name: "StructuralVariationsPivotDetails",
  components: {},
  setup() {
    const store = useStore();
    const selectedPivot = reactiveVuex<SelectedPivot>(store, "selectedPivot", "setSelectedPivot");
    const selectedAssemblies = reactiveVuex<SelectedAssemblies>(store, "selectedAssemblies", "setSelectedAssemblies");
    const selectedSVs = reactiveVuex<SelectedSVs>(store, "selectedSVs", "setSelectedSVs");
    const selectedBlock = reactiveVuex<SelectedBlock>(store, "selectedBlock", "setSelectedBlock");

    const paths = ref<{ [k: string]: Path }>({});
    const pangenome = ref<PangenomeJson>();
    const pivots = ref<PivotJson>();

    getData().then((data) => {
      if (data) {
        pangenome.value = data.pangenome;
        pivots.value = data.pivots;

        const pathNames = Object.keys(pangenome.value.paths) as Array<keyof Paths<Path>>;

        paths.value = pathNames.reduce((result, pathName) => ({
          ...result,
          [pathName]: data.pangenome.paths[pathName]
        }), {});
      }
    });

    const pivotSteps = ref<unknown[]>([]);
    const assemblySteps = ref<unknown[]>([]);
    const visualSteps = ref<unknown[]>([]);

    const assemblyOffset = ref<number>(0);
    const pivotOffset = ref<number>(0);

    const colors = {} as any;
    const tops = {} as any;

    watch(selectedBlock, () => {
      pivotSteps.value = [];
      assemblySteps.value = [];
      visualSteps.value = [];


      if (pangenome.value && selectedBlock.value.pivot && selectedBlock.value.block && selectedBlock.value.assembly && pivots.value) {

        const selectedBlockPivotPath = pangenome.value.paths[selectedBlock.value.pivot];

        const selectedBlockAssemblyPath = pangenome.value.paths[selectedBlock.value.assembly];

        // const selectedBlockSkeletonNode = pangenome.value.panSkeleton[selectedBlock.value.block];


        assemblyOffset.value = 0;
        pivotOffset.value = 0;

        selectedBlockPivotPath?.steps.forEach(step => {
          const panBlock = pangenome.value?.panSkeleton[step.panBlock];

          const otherIndex = panBlock?.traversals[selectedBlock.value.assembly!];
          const otherPanBlock = selectedBlockAssemblyPath?.steps[otherIndex!];

          const lastStep: any = pivotSteps.value[pivotSteps.value.length - 1];

          if (!colors[step.panBlock]) {
            colors[step.panBlock] = `rgba(${(Math.random() * 255)}, ${(Math.random() * 255)}, ${(Math.random() * 255)}, {{alpha}})`
          }
          if (!tops[step.panBlock]) {
            tops[step.panBlock] = `${Math.random() * 1}rem`
          }

          if (otherPanBlock && step.panBlock === selectedBlock.value.block) {
            if (otherPanBlock.startPosition >= step.startPosition) {
              pivotOffset.value = (otherPanBlock.startPosition - step.startPosition) / 4;
              assemblyOffset.value = 0;
            } else {
              pivotOffset.value = 0;
              assemblyOffset.value = (step.startPosition - otherPanBlock.startPosition) / 4;
            }
          }
          // const colorChars = step.panBlock.split('');
          // const colorsNumbersR = colorChars.slice(0, colorChars.length / 3).reduce((result, letter) => {
          //   return result += letter.charCodeAt(0);
          // }, 0) * 60;
          // const colorsNumbersG = colorChars.slice(colorChars.length / 3, colorChars.length / 3 * 2).reduce((result, letter) => {
          //   return result += letter.charCodeAt(0);
          // }, 0) * 60;
          // const colorsNumbersB = colorChars.slice(colorChars.length / 3 * 2, colorChars.length).reduce((result, letter) => {
          //   return result += letter.charCodeAt(0);
          // }, 0) * 60;

          let alpha = step.panBlock === selectedBlock.value.block ? 1 : 0.5;
          if (otherIndex === undefined) {
            alpha -= 0.25
          }

          const pivotStep = {
            name: step.panBlock,
            blockTypes: [] as string[],
            blockClasses: step.panBlock === selectedBlock.value.block ? ['selected'] : [] as string[],
            blockStyles: {
              width: (panBlock!.length! / 4) + 'px',
              // left: Math.max(step.startPosition, otherPanBlock ? otherPanBlock!.startPosition : 0, lastStep ? parseInt(lastStep.blockStyles.left) + parseInt(lastStep.blockStyles.width) : 0) / 4  + 'px',
              left: step.startPosition / 4 + 'px',
              backgroundColor: colors[step.panBlock].replace('{{alpha}}', alpha),
              // top: tops[step.panBlock],
            },
          };
          pivotSteps.value.push(pivotStep);

          // if (otherPanBlock && otherPanBlock.startPosition !== undefined) {
          //
          //   const left = Math.min(step.startPosition, otherPanBlock ? otherPanBlock!.startPosition : step.startPosition) / 4;
          //   const width = (Math.max(step.startPosition, otherPanBlock ? otherPanBlock!.startPosition : step.startPosition) / 4) - left;
          //   const visualStep = {
          //     name: step.panBlock,
          //     blockTypes: [] as string[],
          //     blockClasses: [] as string[],
          //     blockStyles: {
          //       // width: (panBlock!.length! / 4) + 'px',
          //       width: width + 'px',
          //       // left: Math.max(step.startPosition, otherPanBlock ? otherPanBlock!.startPosition : 0, lastStep ? parseInt(lastStep.blockStyles.left) + parseInt(lastStep.blockStyles.width) : 0) / 4  + 'px',
          //       left: left + 'px',
          //       backgroundColor: colors[step.panBlock],
          //       top: tops[step.panBlock],
          //     },
          //   };
          //   visualSteps.value.push(visualStep);
          // }


        });

        selectedBlockAssemblyPath?.steps.forEach(step => {
          const panBlock = pangenome.value?.panSkeleton[step.panBlock];

          const otherIndex = panBlock?.traversals[selectedBlock.value.pivot!];
          const otherPanBlock = selectedBlockPivotPath?.steps[otherIndex!];

          const lastStep: any = assemblySteps.value[assemblySteps.value.length - 1];

          if (!colors[step.panBlock]) {
            colors[step.panBlock] = `rgba(${(Math.random() * 255)}, ${(Math.random() * 255)}, ${(Math.random() * 255)}, {{alpha}})`
          }
          if (!tops[step.panBlock]) {
            tops[step.panBlock] = `${Math.random() * 1}rem`
          }
          // const colorChars = step.panBlock.split('');
          // const colorsNumbersR = colorChars.slice(0, colorChars.length / 3).reduce((result, letter) => {
          //   return result += letter.charCodeAt(0);
          // }, 0) * 60;
          // const colorsNumbersG = colorChars.slice(colorChars.length / 3, colorChars.length / 3 * 2).reduce((result, letter) => {
          //   return result += letter.charCodeAt(0);
          // }, 0) * 60;
          // const colorsNumbersB = colorChars.slice(colorChars.length / 3 * 2, colorChars.length).reduce((result, letter) => {
          //   return result += letter.charCodeAt(0);
          // }, 0) * 60;

          let alpha = step.panBlock === selectedBlock.value.block ? 1 : 0.5;
          if (otherIndex === undefined) {
            alpha -= 0.4
          }

          const assemblyStep = {
            name: step.panBlock,
            blockTypes: [] as string[],
            blockClasses: step.panBlock === selectedBlock.value.block ? ['selected'] : [] as string[],
            blockStyles: {
              width: (panBlock!.length! / 4) + 'px',
              // left: Math.max(step.startPosition, otherPanBlock ? otherPanBlock!.startPosition : 0, lastStep ? parseInt(lastStep.blockStyles.left) + parseInt(lastStep.blockStyles.width) : 0) / 4  + 'px',
              left: step.startPosition / 4 + 'px',
              backgroundColor: colors[step.panBlock].replace('{{alpha}}', alpha),
              // top: tops[step.panBlock],
            },
          };
          assemblySteps.value.push(assemblyStep);
        });

        return;
        // Has "cooccurences"
        // selectedBlockSkeletonNode.cooccurrences




        // if (selectedBlockSkeletonNode.cooccurrences && selectedBlockSkeletonNode.cooccurrences.length) {
        //   const originalCooccurences = [selectedBlock.value.block, ...selectedBlockSkeletonNode.cooccurrences];
        //   let allCooccurences = originalCooccurences.reduce((result, nodeName) => {
        //     if (pangenome.value) {
        //       const nodeSkel = pangenome.value.panSkeleton[nodeName];
        //       if (selectedBlock.value.pivot && selectedBlock.value.assembly) {
        //         const pivotIndex = nodeSkel.traversals[selectedBlock.value.pivot];
        //         const assemblyIndex = nodeSkel.traversals[selectedBlock.value.assembly]
        //         const pivotPath = pangenome.value.paths[selectedBlock.value.pivot];
        //         const assemblyPath = pangenome.value.paths[selectedBlock.value.assembly];
        //         if (pivotPath && pivotIndex) {
        //           const prevPivotPathNode = pivotPath.steps[pivotIndex - 1];
        //           const nextPivotPathNode = pivotPath.steps[pivotIndex + 1];
        //           if (prevPivotPathNode && !result.includes(prevPivotPathNode.panBlock)) {
        //             result.push(prevPivotPathNode.panBlock);
        //           }
        //           if (nextPivotPathNode && !result.includes(nextPivotPathNode.panBlock)) {
        //             result.push(nextPivotPathNode.panBlock);
        //           }
        //         }
        //         if (assemblyPath && assemblyIndex) {
        //           const prevAssemblyPathNode = assemblyPath.steps[assemblyIndex - 1];
        //           const nextAssemblyPathNode = assemblyPath.steps[assemblyIndex + 1];
        //           if (prevAssemblyPathNode && !result.includes(prevAssemblyPathNode.panBlock)) {
        //             result.push(prevAssemblyPathNode.panBlock);
        //           }
        //           if (nextAssemblyPathNode && !result.includes(nextAssemblyPathNode.panBlock)) {
        //             result.push(nextAssemblyPathNode.panBlock);
        //           }
        //         }
        //       }
        //     }
        //     if (!result.includes(nodeName)) {
        //       result.push(nodeName);
        //     }
        //
        //     return result;
        //   }, [] as Array<keyof PanNodes<never>>);
        //
        //   allCooccurences.forEach((nodeName) => {
        //
        //     let pivotNodeAltNames = '';
        //     if (pivots.value && selectedBlock.value.pivot) {
        //       const a = pivots.value[selectedBlock.value.pivot];
        //       if (a) {
        //         const b = a[nodeName];
        //         if (b && selectedBlock.value.assembly) {
        //           const c = b[selectedBlock.value.assembly];
        //           if (c && c.Nodes && c.Nodes.length) {
        //             pivotNodeAltNames = c.Nodes.join(', ');
        //           }
        //         }
        //       }
        //     }
        //
        //     let pathNodeAltNames = '';
        //     if (pivots.value && selectedBlock.value.pivot) {
        //       const a = pivots.value[selectedBlock.value.pivot];
        //       if (a) {
        //         const entries = Object.entries(a) as Array<[keyof PanNodes<Paths<PivotPathNode>>, Paths<PivotPathNode>]>;
        //         entries.forEach(([key, value]) => {
        //           if (selectedBlock.value.assembly) {
        //             const path = value[selectedBlock.value.assembly];
        //             if (path && path.Nodes && path.Nodes.includes(nodeName)) {
        //               pathNodeAltNames = key;
        //             }
        //           }
        //
        //         });
        //       }
        //     }
        //     // const pivotNode = pivots.value.[selectedBlock.value.pivot!]![nodeName][selectedBlock.value.assembly!];
        //
        //     const skeletonNode = pangenome.value?.panSkeleton[nodeName];
        //
        //     const pivotIndex = skeletonNode?.traversals[selectedBlock.value.pivot!];
        //     const assemblyIndex = skeletonNode?.traversals[selectedBlock.value.assembly!];
        //
        //     const pivotPath = pangenome.value?.paths[selectedBlock.value.pivot!];
        //     const assemblyPath = pangenome.value?.paths[selectedBlock.value.assembly!];
        //
        //     const pivotPathNode = pivotPath?.steps[pivotIndex!];
        //     const assemblyPathNode = assemblyPath?.steps[assemblyIndex!];
        //
        //
        //
        //     const pivotStep = {
        //       name: '',
        //       blockTypes: [] as string[],
        //       blockClasses: [] as string[],
        //       blockStyles: {
        //         width: skeletonNode?.length + 'px',
        //         left: (pivotPathNode?.startPosition || assemblyPathNode?.startPosition) + 'px',
        //       } as any,
        //       pivotIndex,
        //       assemblyIndex,
        //     };
        //
        //     const visualStep = {
        //       name: '',
        //       blockTypes: [] as string[],
        //       blockClasses: [] as string[],
        //       blockStyles: {} as any,
        //       pivotIndex,
        //       assemblyIndex,
        //     };
        //
        //
        //     const assemblyStep = {
        //       name: '',
        //       blockTypes: [] as string[],
        //       blockClasses: [] as string[],
        //       blockStyles: {
        //         width: skeletonNode?.length + 'px',
        //         left: (assemblyPathNode?.startPosition || pivotPathNode?.startPosition) + 'px',
        //       } as any,
        //       pivotIndex,
        //       assemblyIndex,
        //     };
        //
        //     if ((pivotIndex !== undefined || assemblyIndex !== undefined) && originalCooccurences.includes(nodeName)) {
        //
        //       if (pivotIndex !== undefined && originalCooccurences.includes(nodeName)) {
        //         pivotStep.name = nodeName;
        //         if (pivotIndex === undefined || assemblyIndex === undefined) {
        //           pivotStep.blockTypes.push('Cooccurence');
        //         }
        //         if (!visualStep.blockTypes.includes('Cooccurence')) {
        //           visualStep.blockTypes.push('Cooccurence');
        //         }
        //         if (!visualStep.blockTypes.includes('Pivot')) {
        //           visualStep.blockTypes.push('Pivot');
        //         }
        //       } else {
        //         pivotStep.name = pathNodeAltNames;
        //       }
        //
        //       if (assemblyIndex !== undefined && originalCooccurences.includes(nodeName)) {
        //         assemblyStep.name = nodeName;
        //         assemblyStep.blockTypes.push('Cooccurence');
        //         if (!visualStep.blockTypes.includes('Cooccurence')) {
        //           visualStep.blockTypes.push('Cooccurence');
        //         }
        //         if (!visualStep.blockTypes.includes('Assembly')) {
        //           visualStep.blockTypes.push('Assembly');
        //         }
        //       } else {
        //         assemblyStep.name = pivotNodeAltNames;
        //       }
        //
        //       pivotSteps.value.push(pivotStep);
        //       visualSteps.value.push(visualStep);
        //       assemblySteps.value.push(assemblyStep);
        //
        //     } else if ((pivotIndex !== undefined || assemblyIndex !== undefined)) {
        //       pivotStep.name = pathNodeAltNames || nodeName;
        //       assemblyStep.name = pivotNodeAltNames || nodeName;
        //       if (!pivotStep.blockClasses.includes('Fade')) {
        //         pivotStep.blockClasses.push('Fade');
        //       }
        //       if (!assemblyStep.blockClasses.includes('Fade')) {
        //         assemblyStep.blockClasses.push('Fade');
        //       }
        //       if (!visualStep.blockClasses.includes('Fade')) {
        //         visualStep.blockClasses.push('Fade');
        //       }
        //       if (!visualStep.blockTypes.includes('Cooccurence')) {
        //         visualStep.blockTypes.push('Cooccurence');
        //       }
        //       pivotSteps.value.push(pivotStep);
        //       visualSteps.value.push(visualStep);
        //       assemblySteps.value.push(assemblyStep);
        //     }
        //     if (nodeName === selectedBlock.value.block && !pivotStep.blockClasses.includes('Selected')) {
        //       pivotStep.blockClasses.push('Selected');
        //     }
        //     if (nodeName === selectedBlock.value.block && !assemblyStep.blockClasses.includes('Selected')) {
        //       assemblyStep.blockClasses.push('Selected');
        //     }
        //     if (nodeName === selectedBlock.value.block && !visualStep.blockClasses.includes('Selected')) {
        //       visualStep.blockClasses.push('Selected');
        //     }
        //
        //     pivotSteps.value.sort((a: any, b: any) => a.assemblyIndex - b.assemblyIndex).sort((a: any, b: any) => a.pivotIndex - b.pivotIndex);
        //     visualSteps.value.sort((a: any, b: any) => a.assemblyIndex - b.assemblyIndex).sort((a: any, b: any) => a.pivotIndex - b.pivotIndex);
        //     assemblySteps.value.sort((a: any, b: any) => a.assemblyIndex - b.assemblyIndex).sort((a: any, b: any) => a.pivotIndex - b.pivotIndex);
        //   });
        // }





        // const selectedBlockPivotNodes = pivots.value[selectedBlock.value.pivot];
        //
        // if (selectedBlockPivotNodes) {
        //   const selectedBlockPivotAssemblies = selectedBlockPivotNodes[selectedBlock.value.block];
        //   const selectedBlockPivotAssemblyNode = selectedBlockPivotAssemblies[selectedBlock.value.assembly];
        //
        //   // Has "cooccurences"
        //   // selectedBlockPivotAssemblyNode.Cooccurence
        // }
        //
        // const pivotPath = pangenome.value.paths[selectedBlock.value.pivot];
        // const pivotNodes = pivots.value[selectedBlock.value.pivot];
        //
        // if (pivotPath) {
        //
        //   const blockIndex = pivotPath.steps.findIndex(step => step.panBlock === selectedBlock.value.block);
        //   const minIndex = Math.max(blockIndex - 1, 0);
        //   const maxIndex = Math.min(blockIndex + 2, pivotPath.steps.length - 1);
        //
        //   // TODO: If the node that's clicked is a co-occurence, go look for its co-occurences and render them differently
        //   // TODO: Render inversion chains somehow
        //   pivotPath.steps.slice(minIndex, maxIndex).forEach((step) => {
        //     const pivotNode = pivotNodes ? pivotNodes[step.panBlock] : undefined;
        //     // const pivotBlock = pangenome.value?.panSkeleton[step.panBlock];
        //     const pivotPathNode = (selectedBlock.value.assembly && pivotNode) ? pivotNode[selectedBlock.value.assembly] : undefined;
        //     const baseBlockTypes = pivotPathNode ? Object.entries(pivotPathNode).filter(([key, value]) => value && typeof value !== 'object' && key !== 'Present').map(([key, value]) => key) : [];
        //     const pivotBlockTypes = baseBlockTypes.filter((value) => value === 'Cooccurence');
        //     const assemblyBlockTypes = baseBlockTypes.filter((value) => value !== 'Cooccurence');
        //     const visualBlockTypes = [...baseBlockTypes];
        //
        //     if (pivotPathNode) {
        //
        //       // Cooccurence
        //       if (pivotPathNode.Cooccurence) {
        //
        //
        //       }
        //       // Insertion
        //       else if (pivotPathNode.Insertion) {
        //
        //         if (pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
        //           pivotPathNode.Nodes.forEach((node) => {
        //             pivotSteps.value.push({ name: '' });
        //             assemblySteps.value.push({ name: node, blockTypes: ['Insertion'] });
        //             visualSteps.value.push({ name: node, blockTypes: ['Insertion'] });
        //
        //           });
        //         }
        //
        //         pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
        //         assemblySteps.value.push({
        //           name: step.panBlock,
        //           blockTypes: assemblyBlockTypes.filter(p => p !== 'Insertion')
        //         });
        //         visualSteps.value.push({
        //           name: step.panBlock,
        //           blockTypes: visualBlockTypes.filter(p => p !== 'Insertion')
        //         });
        //
        //
        //
        //       }
        //       // Swap
        //       else if (pivotPathNode.Swap) {
        //
        //         if (pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
        //           pivotPathNode.Nodes.forEach((node, i) => {
        //
        //             pivotSteps.value.push({ name: i === 0 ? step.panBlock: '', blockTypes: pivotBlockTypes });
        //             assemblySteps.value.push({ name: node, blockTypes: assemblyBlockTypes });
        //             visualSteps.value.push({ name: node, blockTypes: visualBlockTypes });
        //
        //
        //           });
        //         } else {
        //           pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
        //           assemblySteps.value.push({ name: '', blockTypes: assemblyBlockTypes });
        //           visualSteps.value.push({ name: '', blockTypes: visualBlockTypes });
        //
        //
        //         }
        //
        //       } else {
        //
        //         if (pivotPathNode.Present) {
        //
        //           // if (pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
        //           //   pivotPathNode.Nodes.forEach((node) => {
        //           //     pivotSteps.value.push({ name: '' });
        //           //     assemblySteps.value.push({ name: node, blockTypes });
        //           //   });
        //           // }
        //
        //           pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
        //           assemblySteps.value.push({ name: step.panBlock, blockTypes: assemblyBlockTypes });
        //           visualSteps.value.push({ name: step.panBlock, blockTypes: visualBlockTypes });
        //
        //         } else {
        //
        //           if (pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
        //             pivotPathNode.Nodes.forEach((node) => {
        //               pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
        //               assemblySteps.value.push({ name: node, blockTypes: assemblyBlockTypes });
        //               visualSteps.value.push({ name: node, blockTypes: visualBlockTypes });
        //             });
        //           } else {
        //             pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
        //             assemblySteps.value.push({ name: '', blockTypes: assemblyBlockTypes });
        //             visualSteps.value.push({ name: '', blockTypes: visualBlockTypes });
        //           }
        //
        //         }
        //       }
        //     }
        //   });
        // }
      }
    });


    // const pivotSteps = computed(() => {
    //   if (pangenome.value && selectedBlock.value.pivot && pivots.value && selectedBlock.value.assembly) {
    //     const pivotPath = pangenome.value.paths[selectedBlock.value.pivot];
    //     // const assemblyPath = pangenome.value.paths[selectedBlock.value.assembly];
    //     const pivotNodes = pivots.value[selectedBlock.value.pivot];
    //
    //     if (pivotPath) {
    //       const steps: unknown[] = [];
    //       pivotPath.steps.forEach((step) => {
    //         const pivotNode = pivotNodes ? pivotNodes[step.panBlock] : undefined;
    //         const pivotBlock = pangenome.value?.panSkeleton[step.panBlock];
    //         const pivotPathNode = (selectedBlock.value.assembly && pivotNode) ? pivotNode[selectedBlock.value.assembly] : undefined;
    //         const blockTypes = pivotPathNode ? Object.entries(pivotPathNode).filter(([key, value]) => value && typeof value !== 'object' && key !== 'Present').map(([key, value]) => key) : [];
    //         const result = { ...step, ...pivotBlock, ...pivotPathNode };
    //         if (pivotPathNode && pivotPathNode.Nodes && pivotPathNode.Insertion) {
    //           for (let i = 0; i < pivotPathNode.Nodes.length; i++) {
    //             steps.push({ panBlock: '' });
    //           }
    //         }
    //         steps.push(result);
    //       });
    //      return steps;
    //     }
    //   }
    //   return [];
    // });
    //
    // const assemblySteps = computed(() => {
    //   if (pangenome.value && selectedBlock.value.pivot && pivots.value && selectedBlock.value.assembly) {
    //     const pivotPath = pangenome.value.paths[selectedBlock.value.pivot];
    //     // const assemblyPath = pangenome.value.paths[selectedBlock.value.assembly];
    //     const pivotNodes = pivots.value[selectedBlock.value.pivot];
    //
    //     if (pivotPath) {
    //       const steps: unknown[] = [];
    //       pivotPath.steps.forEach((step) => {
    //         const pivotNode = pivotNodes ? pivotNodes[step.panBlock] : undefined;
    //         const pivotBlock = pangenome.value?.panSkeleton[step.panBlock];
    //         const pivotPathNode = (selectedBlock.value.assembly && pivotNode) ? pivotNode[selectedBlock.value.assembly] : undefined;
    //         const blockTypes = pivotPathNode ? Object.entries(pivotPathNode).filter(([key, value]) => value && typeof value !== 'object' && key !== 'Present').map(([key, value]) => key) : [];
    //         const result = { ...step, ...pivotBlock, ...pivotPathNode };
    //         if (pivotPathNode && pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
    //           for (let i = 0; i < pivotPathNode.Nodes.length; i++) {
    //             steps.push({ panBlock: pivotPathNode.Nodes[i], blockTypes });
    //           }
    //         }
    //         if (!result.Present) {
    //           // if (pivotPathNode && pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
    //           //   for (let i = 0; i < pivotPathNode.Nodes.length; i++) {
    //           //     steps.push({ panBlock: pivotPathNode.Nodes[i] });
    //           //   }
    //           // } else {
    //             steps.push({ panBlock: '', blockTypes });
    //           // }
    //           //
    //         } else {
    //           steps.push(result);
    //         }
    //       });
    //       return steps;
    //     }
    //   }
    //   return [];
    // });

    // const assemblySteps = computed(() => {
    //   if (pangenome.value && selectedBlock.value.assembly && pivots.value && selectedBlock.value.assembly) {
    //     const assemblyPath = pangenome.value.paths[selectedBlock.value.assembly];
    //     // const assemblyPath = pangenome.value.paths[selectedBlock.value.assembly];
    //     const assemblyNodes = pivots.value[selectedBlock.value.assembly];
    //
    //     if (assemblyPath) {
    //       const steps = assemblyPath.steps.map((step) => {
    //         const assemblyNode = assemblyNodes ? assemblyNodes[step.panBlock] : undefined;
    //         const assemblyBlock = pangenome.value?.panSkeleton[step.panBlock];
    //         const assemblyPathNode = (selectedBlock.value.assembly && assemblyNode) ? assemblyNode[selectedBlock.value.assembly] : undefined;
    //         const result = { ...step, ...assemblyBlock, ...assemblyPathNode };
    //         return result;
    //       });
    //       return steps;
    //     }
    //   }
    //   return [];
    // });

    const pivotName = computed(() => selectedBlock.value.pivot);
    const assemblyName = computed(() => selectedBlock.value.assembly);

    return {
      selectedBlock,
      pivotSteps,
      assemblySteps,
      visualSteps,
      pivotName,
      assemblyName,
      assemblyOffset,
      pivotOffset,
    };
  }
});
</script>

<style lang="scss" scoped>

.data-area {
  overflow: auto;
}

.data-label {
  height: 2rem;
  line-height: 2rem;
}

.data-block-row {
  position: relative;
  margin: 0 0.5rem;
}

.data-block-row, .data-block-column {
  height: 2rem;
}

.data-label {
  width: 8rem;
}

.data-block-row {
  //line-height: 2rem;
  height: 2rem;
}

.data-block-column {
  position: absolute;
  top: 1.5rem;
  height: 0.5rem;
  line-height: 1rem;
  //text-align: center;
  //width: 6rem;
  background: rgba(127, 127, 127, 0.5);
  border: 1px solid white;
  transition: all 100ms;
  z-index: 1;
  .block-label {
    transition: all 100ms;

    position: absolute;
    transform: rotate(-30deg);
    border: inherit;
    transform-origin: 0 0;
    background: inherit;
    line-height: 1em;
    padding: 2px;
    //border-radius: 2px;
    left: -9px;
    top: -17px;
  }


  &.block-1 {
    //background: rgba(0, 127, 0, 0.5);
  }

  &.block-2 {
    //background: rgba(0, 0, 127, 0.5);
  }

  //.pivot-data-block-cell {
  //  width: calc(1.5rem - 2px);
  //  height: calc(3rem - 2px);
  //}

  //&:hover {
  //  border-color: red;
  //}

  //&.selected {
  //  border-color: green;
  //}
}

.block-label, .block-type, .block-text {
  position: relative;
  font-size: 0.75rem;
  //z-index: 2;
}

.block-type {
  z-index: 1;
}
.block-label {
  z-index: 2;
}
.block-text {
  z-index: 3;
}

.assembly-block.block-type.block-type-insertion {
  position: absolute;
  top: 0;
  bottom: -2px;
  left: 0;
  right: 0;
  background-color: #81CD06;
  //z-index: 0;
}
.visual-block.block-type.block-type-insertion {
  //bottom: 50%;
  //right: -0.3rem;
  width: 0;
  height: 0;
  top: 0;
  border-left: 2.9rem solid transparent;
  border-right: 2.9rem solid transparent;
  border-top: 3rem solid #81CD06;
  //z-index: 1;
}

.assembly-block.block-type.block-type-inversion {
  position: absolute;
  top: 0;
  bottom: -2px;
  left: 0;
  right: 0;
  background-color: #9D0D0D;
  //z-index: 0;
}

.visual-block.block-type.block-type-inversion {
  width: 20px;
  height: 100%;
  top: 0;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}

.visual-block.block-type.block-type-inversion:before {
  display: block;
  content: "";
  width: 10px;
  height: 100%;
  background: linear-gradient(-45deg, #9D0D0D 25%, transparent 25%), linear-gradient(-135deg, #9D0D0D 25%, transparent 25%);
  background-size: 10px 10px;
  background-position: 0;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
}

.visual-block.block-type.block-type-inversion:after {
  display: block;
  content: "";
  width: 10px;
  height: 100%;
  background: linear-gradient(45deg, #9D0D0D 25%, transparent 25%), linear-gradient(135deg, #9D0D0D 25%, transparent 25%);
  background-size: 10px 10px;
  background-position: 0 -7px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 10px;
}

.visual-block.block-type.block-type-cooccurence {
  position: absolute;
  //width: 100%;
  left: -1px;
  right: -1px;
  height: 0;
  top: 50%;
  transform: translateY(-50%);
  border-bottom: 2px solid #0086CA;
}

.pivot-block.block-type.block-type-cooccurence {
  position: absolute;
  height: calc(50% + 1px);
  left: 50%;
  top: calc(-50% - 1px);
  transform: translateX(-50%);
  border-left: 2px solid #0086CA;
}

.assembly-block.block-type.block-type-cooccurence {
  position: absolute;
  height: calc(50% + 1px);
  left: 50%;
  bottom: calc(-50% - 1px);
  transform: translateX(-50%);
  border-left: 2px solid #0086CA;
}

.visual-block.block-type.block-type-inversion {
  width: 20px;
  height: 100%;
  top: 0;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}
.block-style-fade {
  opacity: 0.5;
  .visual-block.block-type.block-type-cooccurence {
    border-bottom-style: dashed;
  }
}

.block-style-selected {
  border: 1px solid black;
  z-index: 2;
}

.visual-block {
  border: 0 none;
  height: 100%;
  transform: translateY(-50%);
}

.block-wrapper {
  position: absolute;
  transition: all 500ms;
}
//.pivot-label-row {
//  position: relative;
//  line-height: 2rem !important;
//}

//.pivot-data-block-row {
//  .data-block-column {
//    &:hover {
//      border-color: transparent;
//    }
//
//    height: 2rem;
//
//    .pivot-data-block-cell {
//      height: calc(2rem - 2px);
//    }
//  }
//}


//.data-block-row {
//  overflow: visible;
//
//  .data-block-column {
//    //border: 1px solid #eee;
//    overflow: visible;
//
//    &.above-pivot {
//      transform: scaleY(-100%);
//    }
//
//    &.below-pivot {
//
//    }
//
//    &.pivot-neighbor {
//      .block-cooccurence {
//        transform: scaleY(-100%);
//      }
//    }
//
//    .data-block-cell {
//      display: block;
//      width: calc(1.5rem - 2px);
//      height: calc(1.5rem - 2px);
//
//      position: absolute;
//      overflow: visible;
//
//
//      &.block-present {
//        background: black;
//        bottom: 0;
//      }
//
//      &.block-cooccurence {
//        bottom: 50%;
//        background: #0086CA;
//        border-radius: 1rem 1rem 0 0;
//      }
//
//      &.block-insertion {
//        bottom: 50%;
//        right: -0.3rem;
//        width: 0;
//        height: 0;
//        border-left: 0.25rem solid transparent;
//        border-right: 0.25rem solid transparent;
//        border-bottom: 1rem solid #81CD06;
//        z-index: 1;
//      }
//
//      &.block-swap-start {
//        //background: red;
//        //background: green;
//        left: 0;
//        bottom: 0.2rem;
//        width: 0;
//        height: 0;
//        border-top: 0.5rem solid transparent;
//        border-bottom: 0.5rem solid transparent;
//
//        border-left: 0.5rem solid #8148A4;
//        //transform: translateY(10%);
//      }
//
//      &.block-swap-end {
//        //background: red;
//        //background: green;
//        right: 0;
//        bottom: 0.2rem;
//        width: 0;
//        height: 0;
//        border-top: 0.5rem solid transparent;
//        border-bottom: 0.5rem solid transparent;
//
//        border-right: 0.5rem solid #8148A4;
//        //transform: translateY(10%);
//      }
//
//      &.block-inversion {
//        left: 0.2rem;
//        bottom: 50%;
//        width: 0;
//        height: 0;
//        border-left: 0.5rem solid transparent;
//        border-right: 0.5rem solid transparent;
//
//        border-bottom: 0.5rem solid #9D0D0D;
//      }
//
//
//      &.block-inversionchain, &.block-inversionchain-start, &.block-inversionchain-end {
//        //left: 0.2rem;
//
//        bottom: 50%;
//
//        height: 50%;
//        //border-left: 0.5rem solid transparent;
//        //border-right: 0.5rem solid transparent;
//
//        //border-bottom: 0.5rem solid #9D0D0D;
//        //border-bottom: 0.125rem solid #9D0D0D;
//        z-index: 1;
//
//        &::before, &::after {
//          display: block;
//          content: "";
//          position: absolute;
//          bottom: 0;
//        }
//
//      }
//
//
//      &.block-inversionchain::before {
//        left: -1px;
//        right: -1px;
//        //width: calc(100% + 2px);
//        border-bottom: 0.2rem solid #9D0D0D;
//      }
//
//      &.block-inversionchain-start::before {
//        left: 50%;
//        right: -1px;
//        border-bottom: 0.2rem solid #9D0D0D;
//      }
//
//      &.block-inversionchain-end::before {
//        left: -1px;
//        right: 50%;
//        border-bottom: 0.2rem solid #9D0D0D;
//      }
//
//      &.block-inversionchain::after, &.block-inversionchain-start::after, &.block-inversionchain-end::after {
//        display: block;
//        content: "";
//        position: absolute;
//        left: 0.2rem;
//        bottom: 0;
//
//        border-left: 0.5rem solid transparent;
//        border-right: 0.5rem solid transparent;
//
//        border-bottom: 0.5rem solid #9D0D0D;
//      }
//
//    }
//  }
//
//}
</style>