<template>
  <div class="structural-variations-details">

    <div class="table-container">
      <v-card tile>
        <div v-if="selectedBlock.pivot && selectedBlock.assembly && selectedBlock.block"
             class="data-area d-flex flex-row">

          <!-- "Header" column -->
          <div class="data-labels col-2 d-flex flex-column pr-0 mr-n1">

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
          <div class="data-block-rows col-10 d-flex flex-column pl-0 mr-1">

            <div class="data-block-row d-flex flex-row">
              <div v-for="(assemblyStep, psIndex) in assemblySteps"
                   :key="`assembly-row-${assemblyName}-step-${assemblyStep.name}`"
                   :class="['data-block-column', `block-${psIndex % 2}`, `elevation-1`]"
              >
                <div :class="[`assembly-block`, `block-type`, `block-type-${blockType.toLowerCase()}`]" v-for="blockType in assemblyStep.blockTypes" :key="`assembly-${assemblyName}-step-${assemblyStep.name}-block-type-text-${blockType}`">
                </div>
                <div class="block-label">
                  {{ assemblyStep.name }}
                </div>
                <div :class="[`assembly-block`, `block-text`, `block-type-${blockType.toLowerCase()}`]" v-for="blockType in assemblyStep.blockTypes" :key="`assembly-${assemblyName}-step-${assemblyStep.name}-block-type-${blockType}`">
                  [{{ blockType }}]
                </div>
              </div>
            </div>

            <div class="data-block-row d-flex flex-row">
              <div v-for="(visualStep, psIndex) in visualSteps"
                   :key="`visual-row-step-${visualStep.name}`"
                   :class="['data-block-column', `block-${psIndex % 2}`, `elevation-1`]"
              >
                <div :class="[`visual-block`, `block-type`, `block-type-${blockType.toLowerCase()}`]" v-for="blockType in visualStep.blockTypes" :key="`visual-${visualName}-step-${visualStep.name}-block-type-text-${blockType}`">
                </div>
                <div class="block-label">
                </div>
                <div :class="[`visual-block`, `block-text`, `block-type-${blockType.toLowerCase()}`]" v-for="blockType in visualStep.blockTypes" :key="`visual-${visualName}-step-${visualStep.name}-block-type-${blockType}`">
                </div>

              </div>
            </div>
            
            <div class="data-block-row d-flex flex-row">
              <div v-for="(pivotStep, psIndex) in pivotSteps"
                   :key="`pivot-row-${pivotName}-step-${pivotStep.name}`"
                   :class="['data-block-column', `block-${psIndex % 2}`, `elevation-1`]"
              >
                <div :class="[`pivot-block`, `block-type`, `block-type-${blockType.toLowerCase()}`]" v-for="blockType in pivotStep.blockTypes" :key="`pivot-${pivotName}-step-${pivotStep.name}-block-type-text-${blockType}`">
                </div>
                <div class="block-label">
                  {{ pivotStep.name }}
                </div>
                <div :class="[`pivot-block`, `block-text`, `block-type-${blockType.toLowerCase()}`]" v-for="blockType in pivotStep.blockTypes" :key="`pivot-${pivotName}-step-${pivotStep.name}-block-type-${blockType}`">
                  [{{ blockType }}]
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
import { PangenomeJson, Path, Paths } from "@/interfaces/pangenome-json";
import { PivotJson } from "@/interfaces/pivot-json";
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

    watch(selectedBlock, () => {
      pivotSteps.value = [];
      assemblySteps.value = [];
      visualSteps.value = [];

      if (pangenome.value && selectedBlock.value.pivot && pivots.value) {




        const pivotPath = pangenome.value.paths[selectedBlock.value.pivot];
        const pivotNodes = pivots.value[selectedBlock.value.pivot];

        if (pivotPath) {

          const blockIndex = pivotPath.steps.findIndex(step => step.panBlock === selectedBlock.value.block);
          const minIndex = Math.max(blockIndex - 1, 0);
          const maxIndex = Math.min(blockIndex + 2, pivotPath.steps.length - 1);

          pivotPath.steps.slice(minIndex, maxIndex).forEach((step) => {
            const pivotNode = pivotNodes ? pivotNodes[step.panBlock] : undefined;
            // const pivotBlock = pangenome.value?.panSkeleton[step.panBlock];
            const pivotPathNode = (selectedBlock.value.assembly && pivotNode) ? pivotNode[selectedBlock.value.assembly] : undefined;
            const baseBlockTypes = pivotPathNode ? Object.entries(pivotPathNode).filter(([key, value]) => value && typeof value !== 'object' && key !== 'Present').map(([key, value]) => key) : [];
            const assemblyBlockTypes = baseBlockTypes.filter((value) => value !== 'Cooccurence');
            const pivotBlockTypes = baseBlockTypes.filter((value) => value === 'Cooccurence');

            if (pivotPathNode) {

              // Insertion
              if (pivotPathNode.Insertion) {

                if (pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
                  pivotPathNode.Nodes.forEach((node) => {
                    pivotSteps.value.push({ name: '' });
                    assemblySteps.value.push({ name: node, blockTypes: ['Insertion'] });
                    visualSteps.value.push({ name: node, blockTypes: ['Insertion'] });

                  });
                }

                pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
                assemblySteps.value.push({
                  name: step.panBlock,
                  blockTypes: assemblyBlockTypes.filter(p => p !== 'Insertion')
                });
                visualSteps.value.push({
                  name: step.panBlock,
                  blockTypes: assemblyBlockTypes.filter(p => p !== 'Insertion')
                });


              // Swap
              } else if (pivotPathNode.Swap) {

                if (pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
                  pivotPathNode.Nodes.forEach((node, i) => {

                    pivotSteps.value.push({ name: i === 0 ? step.panBlock: '', blockTypes: pivotBlockTypes });
                    assemblySteps.value.push({ name: node, blockTypes: assemblyBlockTypes });
                    visualSteps.value.push({ name: node, blockTypes: assemblyBlockTypes });


                  });
                } else {
                  pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
                  assemblySteps.value.push({ name: '', blockTypes: assemblyBlockTypes });
                  visualSteps.value.push({ name: '', blockTypes: assemblyBlockTypes });


                }

              } else {

                if (pivotPathNode.Present) {

                  // if (pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
                  //   pivotPathNode.Nodes.forEach((node) => {
                  //     pivotSteps.value.push({ name: '' });
                  //     assemblySteps.value.push({ name: node, blockTypes });
                  //   });
                  // }

                  pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
                  assemblySteps.value.push({ name: step.panBlock, blockTypes: assemblyBlockTypes });
                  visualSteps.value.push({ name: step.panBlock, blockTypes: assemblyBlockTypes });

                } else {

                  if (pivotPathNode.Nodes && pivotPathNode.Nodes.length) {
                    pivotPathNode.Nodes.forEach((node) => {
                      pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
                      assemblySteps.value.push({ name: node, blockTypes: assemblyBlockTypes });
                      visualSteps.value.push({ name: node, blockTypes: assemblyBlockTypes });
                    });
                  } else {
                    pivotSteps.value.push({ name: step.panBlock, blockTypes: pivotBlockTypes });
                    assemblySteps.value.push({ name: '', blockTypes: assemblyBlockTypes });
                    visualSteps.value.push({ name: '', blockTypes: assemblyBlockTypes });
                  }

                }
              }
            }
          });
        }
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
      assemblyName
    };
  }
});
</script>

<style lang="scss" scoped>

.data-area {
  overflow: auto;
}

.data-label {
  height: 3rem;
  line-height: 3rem;
}

.data-block-row, .data-block-column {
  height: 3rem;
}

.data-label {
  width: 8rem;
}

.data-block-rows, .data-block-row {
  //line-height: 3rem;
  height: 3rem;
}

.data-block-column {
  position: relative;

  width: 6rem;
  background: #eee;
  border: 1px solid transparent;


  &.block-1 {
    background: white;
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