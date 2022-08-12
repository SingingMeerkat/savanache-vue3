<template>
  <div class="structural-variations-details">
    <div v-if="selectedBlock.pivotName && selectedBlock.comparisonName && selectedBlock.blockName"
         class="data-area d-flex flex-row">

      <!-- "Header" column -->
      <div class="data-labels col-2 d-flex flex-column pt-5 pb-1">

        <div class="data-label elevation-1 px-3">
          {{ selectedBlock.comparisonName }}
        </div>

        <!--        <div class="data-label elevation-1 px-3">-->
        <!--        </div>-->

        <div class="data-label elevation-1 px-3">
          {{ selectedBlock.pivotName }}
        </div>

      </div>
      <!-- "Data" column rows -->
      <div ref="dataBlockRowsRef" class="data-block-rows col-10 d-flex flex-column pt-5 pb-1">

        <div class="data-block-row d-flex flex-row">
          <div :style="{ left: comparisonOffset+'px' }" class="block-wrapper">
            <!--            , ...comparisonStep.blockClasses.map(style => `block-style-${style.toLowerCase()}`), ...comparisonStep.blockTypes.map(style => `block-${style.toLowerCase()}`)-->
            <!--            :style="comparisonStep.blockStyles"-->
            <div v-for="(comparisonStep, index) in selectedComparisonSteps"
                 :key="`comparison-row-${selectedBlock.comparisonName}-step-${comparisonStep.panBlock}-${index}`"
                 :class="['data-block-column', `block-${index % 2}`, ...getComparisonStepClasses(comparisonStep.panBlock)]"
                 :name="`comparison-row-${selectedBlock.comparisonName}-step-${comparisonStep.panBlock}-${index}`"
                 :style="getComparisonStepStyles(comparisonStep.panBlock)"
            >
              <!--                  <div :class="[`comparison-block`, `block-type`, `block-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in comparisonStep.blockTypes" :key="`comparison-${comparisonName}-step-${comparisonStep.name}-block-text-${blockType}-${asIndex}-${btIndex}`">-->
              <!--                  </div>-->
              <div class="block-label">
                {{ comparisonStep.panBlock }}
              </div>
              <!--                  <div :class="[`comparison-block`, `block-text`, `block-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in comparisonStep.blockTypes" :key="`comparison-${comparisonName}-step-${comparisonStep.name}-block-${blockType}-${asIndex}-${btIndex}`">-->
              <!--                    [{{ blockType }}]-->
              <!--                  </div>-->
            </div>
          </div>
        </div>

        <!--        <div class="data-block-row d-flex flex-row">-->
        <!--          <div v-for="(visualStep, vsIndex) in visualSteps"-->
        <!--               :key="`visual-row-step-${visualStep.name}-${vsIndex}`"-->
        <!--               :class="['visual-block', 'data-block-column', `block-${vsIndex % 2}`, `elevation-1`, ...visualStep.blockClasses.map(style => `block-style-${style.toLowerCase()}`)]"-->
        <!--               :style="visualStep.blockStyles"-->
        <!--          >-->
        <!--            <div v-for="(blockType, btIndex) in visualStep.blockTypes"-->
        <!--                 :key="`visual-step-${visualStep.name}-block-text-${blockType}-${vsIndex}-${btIndex}`"-->
        <!--                 :class="[`visual-block`, `block-type`, `block-${blockType.toLowerCase()}`]">-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->

        <div class="data-block-row d-flex flex-row">
          <div :style="{ left: pivotOffset+'px' }" class="block-wrapper">
            <!--            , ...pivotStep.blockClasses.map(style => `block-style-${style.toLowerCase()}`), ...pivotStep.blockTypes.map(style => `block-${style.toLowerCase()}`)-->
            <!--            :style="pivotStep.blockStyles"-->
            <div v-for="(pivotStep, index) in selectedPivotSteps"
                 :key="`pivot-row-${selectedBlock.pivotName}-step-${pivotStep.panBlock}-${index}`"
                 :class="['data-block-column', `block-${index % 2}`, ...getPivotStepClasses(pivotStep.panBlock)]"
                 :name="`pivot-row-${selectedBlock.pivotName}-step-${pivotStep.panBlock}-${index}`"
                 :style="getPivotStepStyles(pivotStep.panBlock)"
            >
              <!--                  <div :class="[`pivot-block`, `block-type`, `block-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in pivotStep.blockTypes" :key="`pivot-${pivotName}-step-${pivotStep.name}-block-text-${blockType}-${psIndex}-${btIndex}`">-->
              <!--                  </div>-->
              <div class="block-label">
                {{ pivotStep.panBlock }}
              </div>
              <!--                  <div :class="[`pivot-block`, `block-text`, `block-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in pivotStep.blockTypes" :key="`pivot-${pivotName}-step-${pivotStep.name}-block-${blockType}-${psIndex}-${btIndex}`">-->
              <!--                    [{{ blockType }}]-->
              <!--                  </div>-->

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { reactiveVuex } from "@/store/helper";
// import {selectedComparisonNameKeys, selectedChromosome, selectedPivotName} from '@/data/some-data-source';

export default defineComponent({
  name: "StructuralVariationsPivotDetails",
  components: {},
  setup() {
    const dataBlockRowsRef = ref(null);

    const store = useStore();
    const selectedBlock = reactiveVuex(store, "selectedBlock", "setSelectedBlock");

    const pangenome = ref();
    const chromName = ref();
    const pivots = ref();

    const selectedPivotSteps = computed(() => {
      if (pangenome.value && selectedBlock.value && pangenome.value.paths[selectedBlock.value.pivotName]) {
        return pangenome.value.paths[selectedBlock.value.pivotName][chromName];
      }
      return [];
    });

    const selectedComparisonSteps = computed(() => {
      if (pangenome.value && selectedBlock.value && pangenome.value.paths[selectedBlock.value.comparisonName]) {
        return pangenome.value.paths[selectedBlock.value.comparisonName][chromName];
      }
      return [];
    });

    const selectedPivotBlock = computed(() => {
      return pivots.value[selectedBlock.value.pivotName][selectedBlock.value.comparisonName].blocks[selectedBlock.value.blockName];
    });

    getData().then((data) => {
      if (data) {
        pangenome.value = data.pangenome;
        pivots.value = data.pivots;
      }
    });

    const comparisonOffset = ref(0);
    const pivotOffset = ref(0);
    const scrollOffset = ref(0);

    const highlightComparisonBlock = (panBlock) => {
      const panBlockMatch = panBlock === selectedBlock.value.blockName;
      return panBlockMatch || comparisonNodeInPivotBlock(panBlock);
    };

    const highlightPivotBlock = (panBlock) => {
      return panBlock === selectedBlock.value.blockName;
    };

    const comparisonNodeInPivotBlock = (comparisonPanBlockName) => {

      const coocNodes = selectedPivotBlock.value.coocNodes && selectedPivotBlock.value.coocNodes.find(node => node.comparisonStepPanBlock === comparisonPanBlockName);
      const swapComparisonNodes = selectedPivotBlock.value.swapComparisonNodes && selectedPivotBlock.value.swapComparisonNodes.find(node => node.comparisonStepPanBlock === comparisonPanBlockName);
      const insertionNodes = selectedPivotBlock.value.insertionNodes && selectedPivotBlock.value.insertionNodes.find(node => node.comparisonStepPanBlock === comparisonPanBlockName);
      const inversionChainNodes = selectedPivotBlock.value.inversionChainNodes && selectedPivotBlock.value.inversionChainNodes.find(node => node.comparisonStepPanBlock === comparisonPanBlockName);

      return coocNodes || swapComparisonNodes || insertionNodes || inversionChainNodes;
    };

    const getComparisonStepClasses = (panBlockName) => {
      const comparisonParent =
        pivots.value[selectedBlock.value.pivotName][selectedBlock.value.comparisonName].array.filter(
          (step) => {
            const matchNode = step.panBlock === panBlockName;
            const coocNodes = step.coocNodes && step.coocNodes.find(node => node.comparisonStepPanBlock === panBlockName);
            const swapComparisonNodes = step.swapComparisonNodes && step.swapComparisonNodes.find(node => node.comparisonStepPanBlock === panBlockName);
            const insertionNodes = step.insertionNodes && step.insertionNodes.find(node => node.comparisonStepPanBlock === panBlockName);
            const inversionChainNodes = step.inversionChainNodes && step.inversionChainNodes.find(node => node.comparisonStepPanBlock === panBlockName);
            return matchNode || coocNodes || swapComparisonNodes || insertionNodes || inversionChainNodes;
          }).reduce((result, step) => {

          if (step.coocNodes) {
            if (!result.coocNodes) {
              result.coocNodes = [...step.coocNodes];
            } else {
              result.coocNodes = [...result.coocNodes, ...step.coocNodes];
            }
          }

          if (step.swapComparisonNodes) {
            if (!result.swapComparisonNodes) {
              result.swapComparisonNodes = [...step.swapComparisonNodes];
            } else {
              result.swapComparisonNodes = [...result.swapComparisonNodes, ...step.swapComparisonNodes];
            }
          }

          if (step.insertionNodes) {
            if (!result.insertionNodes) {
              result.insertionNodes = [...step.insertionNodes];
            } else {
              result.insertionNodes = [...result.insertionNodes, ...step.insertionNodes];
            }
          }

          if (step.inversionNodes) {
            if (!result.inversionNodes) {
              result.inversionNodes = [...step.inversionNodes];
            } else {
              result.inversionNodes = [...result.inversionNodes, ...step.inversionNodes];
            }
          }

          if (step.inversionChainNodes) {
            if (!result.inversionChainNodes) {
              result.inversionChainNodes = [...step.inversionChainNodes];
            } else {
              result.inversionChainNodes = [...result.inversionChainNodes, ...step.inversionChainNodes];
            }
          }

          return { ...step, ...result };
        }, {});

      const classes = [];
      if (highlightComparisonBlock(panBlockName)) {
        classes.push("block-selected");
      }
      if (comparisonParent.inversion && comparisonParent.inversionNodes.find(node => node.comparisonStepPanBlock === panBlockName)) {
        classes.push("block-inversion"); // + (typeof comparisonParent.inversion === 'string' ? '-' + comparisonParent.inversion : ''));
      }
      if (comparisonParent.inversionChain && comparisonParent.inversionChainNodes.find(node => node.comparisonStepPanBlock === panBlockName)) {
        classes.push("block-inversion-chain"); // + (typeof comparisonParent.inversionChain === 'string' ? '-' + comparisonParent.inversionChain : ''));
      }
      if (comparisonParent.insertion && comparisonParent.insertionNodes.find(node => node.comparisonStepPanBlock === panBlockName)) {
        classes.push("block-insertion"); // + (typeof comparisonParent.insertion === 'string' ? '-' + comparisonParent.insertion : ''));
      }
      if (comparisonParent.cooc && comparisonParent.coocNodes.find(node => node.comparisonStepPanBlock === panBlockName)) {
        classes.push("block-cooc"); // + (typeof comparisonParent.cooc === 'string' ? '-' + comparisonParent.cooc : ''));
      }
      if (comparisonParent.swap && comparisonParent.swapComparisonNodes.find(node => node.comparisonStepPanBlock === panBlockName)) {
        classes.push("block-swap"); // + (typeof comparisonParent.swap === 'string' ? '-' + comparisonParent.swap : ''));
      }
      if (comparisonParent.deletion) {
        classes.push("block-deletion"); // + (typeof comparisonParent.deletion === 'string' ? '-' + comparisonParent.deletion : ''));
      }
      return classes;
    };

    const getComparisonStepStyles = (panBlockName) => {
      const styles = [];
      if (pangenome.value) {
        const panBlock = pangenome.value.panSkeleton[panBlockName];
        styles.push({ width: (panBlock.length / 4) + "px" });
      }
      return styles;
    };


    const getPivotStepClasses = (panBlockName) => {
      const pivotParent =
        pivots.value[selectedBlock.value.pivotName][selectedBlock.value.comparisonName].blocks[panBlockName];


      const classes = [];
      if (highlightPivotBlock(panBlockName)) {
        classes.push("block-selected");
      }
      if (pivotParent.inversion) {
        classes.push("block-inversion"); // + (typeof pivotParent.inversion === 'string' ? '-' + pivotParent.inversion : ''));
      }
      if (pivotParent.inversionChain) {
        classes.push("block-inversion-chain"); // + (typeof pivotParent.inversionChain === 'string' ? '-' + pivotParent.inversionChain : ''));
      }
      // if (pivotParent.insertion) {
      //   classes.push('block-insertion'); // + (typeof pivotParent.insertion === 'string' ? '-' + pivotParent.insertion : ''));
      // }
      if (pivotParent.cooc) {
        classes.push("block-cooc"); // + (typeof pivotParent.cooc === 'string' ? '-' + pivotParent.cooc : ''));
      }
      if (pivotParent.swap) {
        classes.push("block-swap"); // + (typeof pivotParent.swap === 'string' ? '-' + pivotParent.swap : ''));
      }
      if (pivotParent.deletion) {
        classes.push("block-deletion"); // + (typeof pivotParent.deletion === 'string' ? '-' + pivotParent.deletion : ''));
      }
      return classes;
    };

    const getPivotStepStyles = (panBlockName) => {
      const styles = [];
      if (pangenome.value) {
        const panBlock = pangenome.value.panSkeleton[panBlockName];
        styles.push({ width: (panBlock.length / 4) + "px" });
      }
      return styles;
    };


    // watch(selectedBlock, () => {
    //   pivotSteps.value = [];
    //   comparisonSteps.value = [];
    //   visualSteps.value = [];
    //
    //   const selectedBlockPivotPath = pangenome.value.paths[selectedBlock.value.pivotName];
    //
    //   const selectedBlockComparisonPath = pangenome.value.paths[selectedBlock.value.comparisonName];
    //
    //   comparisonOffset.value = 0;
    //   pivotOffset.value = 0;
    //   scrollOffset.value = 0;
    //
    //   selectedBlockPivotPath.steps.forEach(step => {
    //
    //     console.log("step.panBlock", step.panBlock, "step", step);
    //
    //     const panBlock = pangenome.value.panSkeleton[step.panBlock];
    //
    //     console.log("selectedBlock.value.comparisonName", selectedBlock.value.comparisonName, "panBlock.traversals", panBlock.traversals);
    //
    //     const otherIndex = panBlock.traversals[selectedBlock.value.comparisonName];
    //
    //     console.log("otherIndex", otherIndex, "selectedBlockComparisonPath", selectedBlockComparisonPath, "selectedBlockComparisonPath.steps", selectedBlockComparisonPath.steps);
    //
    //     const otherPanBlock = selectedBlockComparisonPath.steps[otherIndex];
    //
    //     const pivotPathnodes = pivots.value[selectedBlock.value.pivotName];
    //
    //     const pivotPathNode = pivotPathnodes[selectedBlock.value.comparisonName].blocks[step.panBlock];
    //
    //     const blockTypes = pivotPathNode ? Object.entries(pivotPathNode).filter(([key, value]) => value && typeof value !== "object" && key !== "insertion").map(([key]) => key) : [];
    //
    //     console.log("step.panBlock", step.panBlock, "otherPanBlock", otherPanBlock, "selectedBlock", selectedBlock.value);
    //
    //     const offsets = calculateOffset({
    //       step,
    //       otherPanBlock,
    //       selectedBlock
    //     });
    //
    //     console.log("OFFSETS", JSON.stringify(offsets));
    //
    //     if (selectedBlock.value.blockName === step.panBlock) {
    //       comparisonOffset.value = offsets.comparisonOffset;
    //       pivotOffset.value = offsets.pivotOffset;
    //       scrollOffset.value = offsets.totalOffset;
    //
    //       if (dataBlockRowsRef.value) {
    //         const proportions = ((dataBlockRowsRef.value.clientWidth / 3) - (panBlock.length / (4 * 3)));
    //         console.log("scrollOffset.value", scrollOffset.value, "panBlock.length", panBlock.length, "dataBlockRowsRef.value.clientWidth", dataBlockRowsRef.value.clientWidth, "proportions", proportions);
    //         dataBlockRowsRef.value.scrollLeft = scrollOffset.value - proportions;
    //       } else {
    //         setTimeout(() => {
    //           if (dataBlockRowsRef.value) {
    //             const proportions = ((dataBlockRowsRef.value.clientWidth / 3) - (panBlock.length / (4 * 3)));
    //             console.log("scrollOffset.value", scrollOffset.value, "panBlock.length", panBlock.length, "dataBlockRowsRef.value.clientWidth", dataBlockRowsRef.value.clientWidth, "proportions", proportions);
    //             dataBlockRowsRef.value.scrollLeft = scrollOffset.value - proportions;
    //           }
    //         }, 200);
    //       }
    //     }
    //
    //     const selected = isSelectedStep({
    //       step,
    //       selectedBlock,
    //       reversePanBlock: null,
    //       panBlock: null
    //     });
    //
    //     const pivotStep = newVisualStep({
    //       step,
    //       blockTypes,
    //       selected,
    //       panBlock
    //     });
    //
    //     pivotSteps.value.push(pivotStep);
    //   });
    //
    //   if (selectedBlockComparisonPath) {
    //     selectedBlockComparisonPath.steps.forEach(step => {
    //
    //       const panBlock = pangenome.value.panSkeleton[step.panBlock];
    //
    //       const otherIndex = panBlock.traversals[selectedBlock.value.pivotName];
    //
    //       const otherPanBlock = selectedBlockPivotPath.steps[otherIndex];
    //
    //       const lastStep = comparisonSteps.value[comparisonSteps.value.length - 1];
    //
    //       const pivotPathNode = null;
    //       const reversePanBlock = "";
    //
    //       const pivotPathnodes = pivots.value[selectedBlock.value.pivotName];
    //
    //       if (pivotPathnodes[selectedBlock.value.comparisonName] && pivotPathnodes[selectedBlock.value.comparisonName].blocks && pivotPathnodes[selectedBlock.value.comparisonName].blocks[step.panBlock]) {
    //
    //         // Make it so the block that has the "insert" property on it, doesn't show up as "the" insert (the block before it should show up as the insert)
    //         pivotPathNode = { ...pivotPathnodes[selectedBlock.value.comparisonName].blocks[step.panBlock], insertion: undefined };
    //       } else {
    //         // Grab all the kinds of structural variations on the pivot (They are key:value pairs, either boolean, or string (start, end, etc.))
    //         Object.entries(pivots.value[selectedBlock.value.pivotName][selectedBlock.value.comparisonName].blocks).every(([name, block]) => {
    //           debugger;
    //           if (
    //             (block.coocNodes && block.coocNodes.find(node => node.panBlock === selectedBlock.value.blockName)) ||
    //             (block.swapComparisonNodes && block.swapComparisonNodes.find(node => node.panBlock === selectedBlock.value.blockName)) ||
    //             (block.insertionNodes && block.insertionNodes.find(node => node.panBlock === selectedBlock.value.blockName))
    //           ) {
    //             debugger;
    //             reversePanBlock = name;
    //             pivotPathNode = { ...block, cooc: undefined };
    //             return selectedBlock.value.blockName !== name;
    //           }
    //           return true;
    //         });
    //       }
    //       const blockTypes = pivotPathNode ? Object.entries(pivotPathNode).filter(([key, value]) => value && typeof value !== "object").map(([key, value]) => key) : [];
    //
    //       if (panBlock.coocs.length && !blockTypes.includes("cooc")) {
    //         blockTypes.push("cooc");
    //       }
    //
    //       const selected = isSelectedStep({
    //         step,
    //         selectedBlock,
    //         reversePanBlock,
    //         panBlock
    //       });
    //
    //       const comparisonStep = newVisualStep({
    //         step,
    //         blockTypes,
    //         selected,
    //         panBlock
    //       });
    //
    //       comparisonSteps.value.push(comparisonStep);
    //     });
    //   }
    // });

    return {
      selectedPivotSteps,
      selectedComparisonSteps,

      selectedBlock,

      comparisonOffset,
      pivotOffset,
      scrollOffset,

      getComparisonStepClasses,
      getComparisonStepStyles,

      getPivotStepClasses,
      getPivotStepStyles,

      dataBlockRowsRef
    };
  }
});
</script>

<style lang="scss" scoped>

.structural-variations-details {

}

.data-block-rows {
  overflow: auto;
  width: 100%;
}

.data-area {
  //overflow: auto;
}

.data-label {
  height: 3rem;
  line-height: 3rem;
}

.data-block-row {
  position: relative;
  margin: 0 0.5rem;
}

.data-block-row, .data-block-column {
  height: 3rem;
}

.data-label {
  width: 8rem;
}

.block-wrapper {
  //position: absolute;
  transition: all 500ms;
  white-space: nowrap;
}

.data-block-column {
  display: inline-block;
  //position: relative;
  position: relative;
  top: 1.5rem;
  height: 0.5rem;
  line-height: 1rem;
  //text-align: center;
  //width: 6rem;
  background: lightgray;
  opacity: 0.25;
  //background: rgba(127, 127, 127, 0.5);
  border: 1px solid white;
  transition: all 100ms;
  z-index: 1;

  &:hover:not(.block-style-selected) {
    z-index: 3;
    opacity: 0.75;
  }

  .block-label {
    transition: all 100ms;

    position: absolute;
    transform: rotate(-45deg);
    //transform: rotate(-15deg);
    border: inherit;
    transform-origin: 0 0;
    background: inherit;
    line-height: 1em;
    padding: 2px;
    //border-radius: 2px;
    //left: -6px;
    //top: -19px;
    left: -13px;
    top: -14px;
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

.block-present {
  background: black;
  color: white;
}

.block-insertion {
  background: #81CD06 !important;
  color: black;
}

.block-inversion, .block-inversion-chain {
  background: #9D0D0D !important;
  color: white;
}

.block-cooc {
  background: #0086CA !important;
  color: white;
}

.block-swap {
  background: #8148A4 !important;
  color: white;
}

.block-inversion.block-cooc, .block-inversion-chain.block-cooc {
  background: linear-gradient(0deg, #0086CA 50%, #9D0D0D 50%) !important;
}

.block-inversion.block-insertion, .block-inversion-chain.block-insertion {
  background: linear-gradient(0deg, #81CD06 50%, #9D0D0D 50%) !important;
}

.block-inversion.block-cooc.block-insertion, .block-inversion-chain.block-cooc.block-insertion {
  background: linear-gradient(0deg, #0086CA 33%, #9D0D0D 33%, #9D0D0D 66%, #81CD06 66%) !important;
}


.block-cooc.block-insertion {
  background: linear-gradient(0deg, #0086CA 50%, #81CD06 50%) !important;
}

.block-swap.block-insertion {
  background: linear-gradient(0deg, #8148A4 50%, #81CD06 50%) !important;
}

.block-swap.block-cooc {
  background: linear-gradient(0deg, #0086CA 50%, #8148A4 50%) !important;
}

.block-swap.block-cooc.block-insertion {
  background: linear-gradient(0deg, #0086CA 33%, #8148A4 33%, #8148A4 66%, #81CD06 66%) !important;
}

.comparison-block.block-type.block-insertion {
  position: absolute;
  top: 0;
  bottom: -2px;
  left: 0;
  right: 0;
  background-color: #81CD06;
  //z-index: 0;
}

.visual-block.block-type.block-insertion {
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

.comparison-block.block-type.block-inversion {
  position: absolute;
  top: 0;
  bottom: -2px;
  left: 0;
  right: 0;
  background-color: #9D0D0D;
  //z-index: 0;
}

.visual-block.block-type.block-inversion {
  width: 20px;
  height: 100%;
  top: 0;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}

.visual-block.block-type.block-inversion:before {
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

.visual-block.block-type.block-inversion:after {
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

.visual-block.block-type.block-cooc {
  position: absolute;
  //width: 100%;
  left: -1px;
  right: -1px;
  height: 0;
  top: 50%;
  transform: translateY(-50%);
  border-bottom: 2px solid #0086CA;
}

.pivot-block.block-type.block-cooc {
  position: absolute;
  height: calc(50% + 1px);
  left: 50%;
  top: calc(-50% - 1px);
  transform: translateX(-50%);
  border-left: 2px solid #0086CA;
}

.comparison-block.block-type.block-cooc {
  position: absolute;
  height: calc(50% + 1px);
  left: 50%;
  bottom: calc(-50% - 1px);
  transform: translateX(-50%);
  border-left: 2px solid #0086CA;
}

.visual-block.block-type.block-inversion {
  width: 20px;
  height: 100%;
  top: 0;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}

.block-style-fade {
  opacity: 0.5;

  .visual-block.block-type.block-cooc {
    border-bottom-style: dashed;
  }
}

.block-selected {
  border: 1px solid black;
  z-index: 2;
  opacity: 1;
}

.visual-block {
  border: 0 none;
  height: 100%;
  transform: translateY(-50%);
}

</style>