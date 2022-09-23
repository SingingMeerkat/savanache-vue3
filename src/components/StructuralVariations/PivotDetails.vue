<template>
  <div class="structural-variations-details">
<!--    <v-slider-->
<!--      label="Scale"-->
<!--      v-model="scaleExp"-->
<!--      :ticks="scaleTicksLabels"-->
<!--      :max="scaleMaxExp"-->
<!--      step="1"-->
<!--      show-ticks="always"-->
<!--      tick-size="4"-->
<!--      :disabled="!(selectedBlock.pivotName && selectedBlock.comparisonName && selectedBlock.blockName)"-->
<!--    ></v-slider>-->

    <div v-if="selectedBlock.pivotName && selectedBlock.comparisonName && selectedBlock.blockName"
         class="data-area d-flex flex-row">

      <!-- "Header" column -->
      <div class="data-labels col-2 d-flex flex-column pb-1">

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
      <div ref="dataBlockRowsRef" class="data-block-rows col-10 d-flex flex-column pb-1">

        <div class="data-block-row data-comparison-row d-flex flex-row">
          <div :style="{ left: comparisonOffset + 'px' }" class="block-wrapper">
            <div v-for="(comparisonStep, index) in selectedComparisonSteps"
                 :key="`comparison-row-${selectedBlock.comparisonName}-step-${comparisonStep.panBlockName}`"
                 :class="['data-block-column', `block-${index % 2}`, ...comparisonStep.nodeTypeClasses.map(cls => `block-${cls}`)]"
                 :style="{width: comparisonStep.displayLength + 'px'}"
            >
              <div class="block-label">{{ comparisonStep.panBlockName }}</div>
<!--              <div v-for="nodeTypeClass in comparisonStep.nodeTypeClasses" :key="`comparison-row-${selectedBlock.comparisonName}-step-${comparisonStep.panBlockName}-${nodeTypeClass}`" :class="['block-type', `block-${nodeTypeClass}`]"></div>-->
            </div>
          </div>
        </div>

<!--        <svg width="100%" height="36" class="svg-visualization" style="position: absolute; bottom: 2.25rem;">-->
<!--          <template v-for="visualStep in selectedVisualSteps"-->
<!--               :key="`visual-row-${selectedBlock.visualName}-step-${visualStep.panBlockName}`"-->
<!--          >-->
<!--            <polygon v-if="visualStep.type === 'insertion'" :points="visualStep.points" style="fill:lime;stroke:purple;stroke-width:1" />-->
<!--          </template>-->

<!--&lt;!&ndash;          <line x1="0" y1="18" x2="100" y2="18" stroke="#0086CA" stroke-width="8" />&ndash;&gt;-->
<!--        </svg>-->

        <div class="data-block-row data-pivot-row d-flex flex-row">
          <div :style="{ left: pivotOffset + 'px' }" class="block-wrapper">
            <div v-for="(pivotStep, index) in selectedPivotSteps"
                 :key="`pivot-row-${selectedBlock.pivotName}-step-${pivotStep.panBlockName}`"
                 :class="['data-block-column', `block-${index % 2}`, ...pivotStep.nodeTypeClasses.map(cls => `block-${cls}`)]"
                 :style="{width: pivotStep.displayLength + 'px'}"
            >
              <div class="block-label">{{ pivotStep.panBlockName }}</div>
<!--              <div v-for="nodeTypeClass in pivotStep.nodeTypeClasses" :key="`pivot-row-${selectedBlock.pivotName}-step-${pivotStep.panBlockName}-${nodeTypeClass}`" :class="['block-type', `block-${nodeTypeClass}`]"></div>-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { reactiveVuex } from "@/store/helper";

export default defineComponent({
  name: "StructuralVariationsPivotDetails",
  components: {},
  setup() {

    const dataBlockRowsRef = ref(null);

    const store = useStore();
    const selectedBlock = reactiveVuex(store, "selectedBlock", "setSelectedBlock");

    const chromName = reactiveVuex(store, "chromOnDisplay", "setChromOnDisplay");
    //const chromName = chromOnDisplay.value;

    const pangenome = ref();
    const pivots = ref();

    const preNodes = 2;
    const postNodes = 2;

    const selectedPivotSteps = ref([]);
    const selectedComparisonSteps = ref([]);
    // const selectedVisualSteps = ref([]);
    const scaleBase = 4;
    const scaleMaxExp = 5;
    const scaleTicksLabels = {};
    for (let i = 0; i <= scaleMaxExp; i++) {
      scaleTicksLabels[i] = `1/${Math.pow(scaleBase, i)}`
    }
    const scaleExp = ref(0);

    let comparisonStepKeys = {};

    const makeComparisonNode = ({currentPivotStep, block, comparisonPath, pivotBlock, type}) => {
      if (currentPivotStep && currentPivotStep.nodeTypeClasses && !currentPivotStep.nodeTypeClasses.includes(type)) {
        currentPivotStep.nodeTypeClasses.push(type);
      }
      const compareNode = comparisonPath[block.comparedPathStepIndex];
      if (compareNode) {
        const comparisonStep = comparisonStepKeys[compareNode.panBlock] || {
          comparedPathStepIndex: block.comparedPathStepIndex,
          panBlockName: compareNode.panBlock,
          comparisonName: selectedBlock.value.comparisonName,
          start: compareNode.startPosition,
          end: compareNode.endPosition,
          length: compareNode.endPosition - compareNode.startPosition,

          displayStart: Math.log2(compareNode.startPosition) * 10,
          displayEnd: Math.log2(compareNode.endPosition) * 10,
          displayLength: (Math.log2(compareNode.endPosition - compareNode.startPosition)) * 10,

          nodeTypeClasses: [type],
        };
        comparisonStepKeys[compareNode.panBlock] = comparisonStep;
        if (!selectedComparisonSteps.value.includes(comparisonStep)) {
          selectedComparisonSteps.value.push(comparisonStep);
        }
        if (!comparisonStep.nodeTypeClasses.includes(type)) {
          comparisonStep.nodeTypeClasses.push(type);
        }
        if (pivotBlock) {
          comparisonStep.pivotStepIndex = pivotBlock.pivotStepIndex;
          comparisonStep.pivotPanBlockName = pivotBlock.panBlock;
          if (pivotBlock.panBlock === selectedBlock.value.blockName && !comparisonStep.nodeTypeClasses.includes('selected')) {
            comparisonStep.nodeTypeClasses.push('selected');
          }
          if (pivotBlock.panBlock === selectedBlock.value.blockName && !comparisonStep.nodeTypeClasses.includes('selected-' + type)) {
            comparisonStep.nodeTypeClasses.push('selected-' + type);
          }
        }
        comparisonStep.nodeTypeClasses = comparisonStep.nodeTypeClasses.sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
        if (comparisonStep.nodeTypeClasses.includes('inversion') && comparisonStep.nodeTypeClasses.includes('inversion-chain')) {
          comparisonStep.nodeTypeClasses = comparisonStep.nodeTypeClasses.filter(c => c !== 'inversion');
        }
      }
    };

    const makeComparisonNodeList = ({currentPivotStep, blocks, comparisonPath, pivotBlock, type}) => {
      blocks.forEach(block => {
        makeComparisonNode({currentPivotStep, block, comparisonPath, pivotBlock, type});
      });
    };

    // "Build" (generate) the two rows of data to display in the pivot details
    const buildSteps = () => {
      selectedPivotSteps.value = [];
      selectedComparisonSteps.value = [];
      comparisonStepKeys = {};

      /*
      pivotDefinition:
      {
        "array": [{
          "panBlock": "Node_A_0",
          "pivotStepIndex": 0,
          "cooc": true,
          "coocNodes": [{
            "pivotStepPanBlock": "Node_A_0",
            "comparedPathChromName": "chrom1",
            "comparedPathStepIndex": 15,
            "comparedPathStepPanBlock": "Node_A_4"
          }, {
            "pivotStepPanBlock": "Node_A_0",
            "comparedPathChromName": "chrom1",
            "comparedPathStepIndex": 16,
            "comparedPathStepPanBlock": "Node_A_5"
          }]
        },...],
        "blocks": {
          "Node_A_0": {
            "panBlock": "Node_A_0",
            "pivotStepIndex": 0,
            "cooc": true,
            "coocNodes": [{
              "pivotStepPanBlock": "Node_A_0",
              "comparedPathChromName": "chrom1",
              "comparedPathStepIndex": 15,
              "comparedPathStepPanBlock": "Node_A_4"
            }, {
              "pivotStepPanBlock": "Node_A_0",
              "comparedPathChromName": "chrom1",
              "comparedPathStepIndex": 16,
              "comparedPathStepPanBlock": "Node_A_5"
            }]
          },...
        }
      };
      */
      const pivotDefinition = pivots.value[selectedBlock.value.pivotName][selectedBlock.value.comparisonName];

      const selectedPivotBlock = pivotDefinition.blocks[selectedBlock.value.blockName];
      const selectedPivotStepIndex = selectedPivotBlock.pivotStepIndex;

      /*
      pivotPath:
      [{
        "panBlock": "Node_A_0",
        "startPosition": 0,
        "endPosition": 111,
        "strand": 1
      }, ...];
      */
      const pivotPath = pangenome.value.paths[selectedBlock.value.pivotName][chromName.value];
      const comparisonPath = pangenome.value.paths[selectedBlock.value.comparisonName][chromName.value];


      // [-2][-1][selected][+1][+2]
      const pivotSection = pivotPath.slice(Math.max(selectedPivotStepIndex - preNodes, 0), Math.min(selectedPivotStepIndex + postNodes + 1, pivotPath.length));


      // pivotSection.forEach(pivotNode => {
      for (let pivotSectionIndex = 0; pivotSectionIndex < pivotSection.length; pivotSectionIndex++) {
        const pivotNode = pivotSection[pivotSectionIndex];
        /*
        pivotNode:
        {
          "panBlock": "Node_A_0",
          "startPosition": 0,
          "endPosition": 111,
          "strand": 1
        };
        */

        // deletedNodes
        // inversionChainNodes
        // swapComparedNodes
        // swapPivotNodes
        // insertionNodes
        // inversionNodes
        // coocNodes

        // swapOrDeleteNodes // shouldn't exist as it's only a temporary step to determine if it's a swap or delete in the second pass

        // comparedPathStepIndex

        // We want to generate all comparison steps for each pivot step (typically 1:1, but could be none (absence/deletion) or more than 1 for swaps, insertions, etc.)


        /*
        pivotBlock:
        {
          "panBlock": "Node_A_0",
          "pivotStepIndex": 0,
          "cooc": true,
          "coocNodes": [{
            "pivotStepPanBlock": "Node_A_0",
            "comparedPathChromName": "chrom1",
            "comparedPathStepIndex": 15,
            "comparedPathStepPanBlock": "Node_A_4"
          }, {
            "pivotStepPanBlock": "Node_A_0",
            "comparedPathChromName": "chrom1",
            "comparedPathStepIndex": 16,
            "comparedPathStepPanBlock": "Node_A_5"
          }]
        }
        */
        if (!pivotNode || !pivotNode.panBlock) {
          debugger;
        }
        const pivotBlock = pivotDefinition.blocks[pivotNode.panBlock];

        const currentPivotStep = {
          comparedPathStepIndex: pivotBlock.comparedPathStepIndex,
          pivotStepIndex: pivotBlock.pivotStepIndex,
          panBlockName: pivotBlock.panBlock,
          pivotName: selectedBlock.value.pivotName,
          start: pivotNode.startPosition,
          end: pivotNode.endPosition,
          length: pivotNode.endPosition - pivotNode.startPosition,

          displayStart: Math.log2(pivotNode.startPosition) * 10,
          displayEnd: Math.log2(pivotNode.endPosition) * 10,
          displayLength: (Math.log2(pivotNode.endPosition - pivotNode.startPosition)) * 10,

          nodeTypeClasses: [],
        };
        selectedPivotSteps.value.push(currentPivotStep);
        if (pivotBlock.panBlock === selectedBlock.value.blockName) {
          currentPivotStep.nodeTypeClasses.push('selected');
        }

        // Deleted
        if (pivotBlock.deletedNodes && pivotBlock.deletedNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.deletedNodes, comparisonPath, pivotBlock, type: 'deleted'});
          pivotBlock.deletedNodes.forEach(node => {
            // const linkedPivotBlock = pivotDefinition.blocks[node.pivotStepPanBlock];
            const linkedPivotStepNode = pivotPath[node.pivotStepIndex];
            if (linkedPivotStepNode && !pivotSection.includes(linkedPivotStepNode)) {
              pivotSection.push(linkedPivotStepNode);
            } else {
              // debugger;
            }
          });
        }

        // Inversion
        if (pivotBlock.inversionNodes && pivotBlock.inversionNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.inversionNodes, comparisonPath, pivotBlock, type: 'inversion'});
          pivotBlock.inversionNodes.forEach(node => {
            // const linkedPivotBlock = pivotDefinition.blocks[node.pivotStepPanBlock];
            const linkedPivotStepNode = pivotPath[node.pivotStepIndex];
            if (linkedPivotStepNode && !pivotSection.includes(linkedPivotStepNode)) {
              pivotSection.push(linkedPivotStepNode);
            } else {
              // debugger;
            }
          });
        }

        // InversionChain
        if (pivotBlock.inversionChainNodes && pivotBlock.inversionChainNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.inversionChainNodes, comparisonPath, pivotBlock, type: 'inversion-chain'});
          pivotBlock.inversionChainNodes.forEach(node => {
            // const linkedPivotBlock = pivotDefinition.blocks[node.pivotStepPanBlock];
            const linkedPivotStepNode = pivotPath[node.pivotStepIndex];
            if (linkedPivotStepNode && !pivotSection.includes(linkedPivotStepNode)) {
              pivotSection.push(linkedPivotStepNode);
            } else {
              // debugger;
            }
          });
        }

        // Swap (Compared nodes)
        if (pivotBlock.swapComparedNodes && pivotBlock.swapComparedNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.swapComparedNodes, comparisonPath, pivotBlock, type: 'swap'});
          pivotBlock.swapComparedNodes.forEach(node => {
            // const linkedPivotBlock = pivotDefinition.blocks[node.pivotStepPanBlock];
            const linkedPivotStepNode = pivotPath[node.pivotStepIndex];
            if (linkedPivotStepNode && !pivotSection.includes(linkedPivotStepNode)) {
              pivotSection.push(linkedPivotStepNode);
            } else {
              // debugger;
            }
          });
        }

        // Swap (Pivot nodes)
        if (pivotBlock.swapPivotNodes && pivotBlock.swapPivotNodes.length) {
          pivotBlock.swapPivotNodes.forEach(node => {
            // const linkedPivotBlock = pivotDefinition.blocks[node.pivotStepPanBlock];
            const linkedPivotStepNode = pivotPath[node.pivotStepIndex];
            if (linkedPivotStepNode && !pivotSection.includes(linkedPivotStepNode)) {
              pivotSection.push(linkedPivotStepNode);
            } else {
              // debugger;
            }
          });
        }

        // Insertion
        if (pivotBlock.insertionNodes && pivotBlock.insertionNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.insertionNodes, comparisonPath, pivotBlock, type: 'insertion'});
          pivotBlock.insertionNodes.forEach(node => {
            // const linkedPivotBlock = pivotDefinition.blocks[node.pivotStepPanBlock];
            const linkedPivotStepNode = pivotPath[node.pivotStepIndex];
            if (linkedPivotStepNode && !pivotSection.includes(linkedPivotStepNode)) {
              pivotSection.push(linkedPivotStepNode);
            } else {
              // debugger;
            }
          });
        }

        // Cooc
        if (pivotBlock.coocNodes && pivotBlock.coocNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.coocNodes, comparisonPath, pivotBlock, type: 'cooc'});
          pivotBlock.coocNodes.forEach(node => {
            // const linkedPivotBlock = pivotDefinition.blocks[node.pivotStepPanBlock];
            const linkedPivotStepNode = pivotPath[node.pivotStepIndex];
            if (linkedPivotStepNode && !pivotSection.includes(linkedPivotStepNode)) {
              pivotSection.push(linkedPivotStepNode);
            } else {
              // debugger;
            }
          });
        }

        // Present
        if (pivotBlock.comparedPathStepIndex !== undefined) {
          makeComparisonNode({currentPivotStep, block: pivotBlock, comparisonPath, pivotBlock, type: 'present'});
        }

        // currentPivotStep.nodeTypeClasses = currentPivotStep.nodeTypeClasses.sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
        // if (currentPivotStep.nodeTypeClasses.includes('inversion') && currentPivotStep.nodeTypeClasses.includes('inversion-chain')) {
        //   currentPivotStep.nodeTypeClasses = currentPivotStep.nodeTypeClasses.filter(c => c !== 'inversion');
        // }

      // });
      }

      // let selectedPivotStepsOffset = 0;
      // let selectedComparisonStepsOffset = 0;

      let selectedPivotStepsStart = null;
      let selectedComparisonStepsStart = null;

      selectedPivotSteps.value = selectedPivotSteps.value.sort((a, b) => a.pivotStepIndex - b.pivotStepIndex);
      selectedComparisonSteps.value = selectedComparisonSteps.value.sort((a, b) => a.comparedPathStepIndex - b.comparedPathStepIndex);

      if (selectedComparisonSteps.value[0]) {
        let lastStepEnd = 0;
        for (let i = 0; i < selectedComparisonSteps.value.length; i++) {
          const step = selectedComparisonSteps.value[i];
          step.vizStart = lastStepEnd;
          step.vizEnd = step.vizStart + step.displayLength;
          lastStepEnd = step.vizEnd;
          if (selectedComparisonStepsStart === null && step.nodeTypeClasses.includes('selected')) {
            selectedComparisonStepsStart = step.vizStart;
          } else if (step.nodeTypeClasses.includes('selected') && step.panBlockName === selectedBlock.value.blockName) {
            selectedComparisonStepsStart = step.vizStart;
          }
        }
      }

      if (selectedPivotSteps.value[0]) {
        let lastStepEnd = 0;
        for (let i = 0; i < selectedPivotSteps.value.length; i++) {
          const step = selectedPivotSteps.value[i];
          step.vizStart = lastStepEnd;
          step.vizEnd = step.vizStart + step.displayLength;
          lastStepEnd = step.vizEnd;
          if (selectedPivotStepsStart === null && step.nodeTypeClasses.includes('selected')) {
            selectedPivotStepsStart = step.vizStart;
          } else if (step.nodeTypeClasses.includes('selected') && step.panBlockName === selectedBlock.value.blockName) {
            selectedPivotStepsStart = step.vizStart;
          }
        }
      }

      if (selectedPivotStepsStart !== null && selectedComparisonStepsStart !== null) {
        const diff = selectedPivotStepsStart - selectedComparisonStepsStart;

        if (diff > 0) {
          comparisonOffset.value = diff;
          pivotOffset.value = 0;
        } else {
          comparisonOffset.value = 0;
          pivotOffset.value = diff * -1;
        }
      } else {
        comparisonOffset.value = 0;
        pivotOffset.value = 0;
      }
      // console.log2('selectedPivotStepsOffset', selectedPivotStepsOffset, 'selectedComparisonStepsOffset', selectedComparisonStepsOffset);
    };

    watch(chromName, () => {
      getData(chromName.value).then((data) => {
        if (data) {
          pangenome.value = data.pangenome;
          pivots.value = data.pivots[chromName.value];
          //pivots.value = data.pivots;
        }
      });
    });

    watch(selectedBlock, buildSteps);

    const comparisonOffset = ref(0);
    const pivotOffset = ref(0);

    return {
      selectedPivotSteps,
      selectedComparisonSteps,

      selectedBlock,

      comparisonOffset,
      pivotOffset,

      dataBlockRowsRef,

      scaleBase,
      scaleTicksLabels,
      scaleExp,
      scaleMaxExp,
    };
  }
});
</script>

<style lang="scss" scoped>

.structural-variations-details {
  .data-area {
    .data-labels {
      .data-label {
        height: 3rem;
        line-height: 3rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .data-block-rows {
      position: relative;
      overflow: auto;
      width: 100%;

      .data-block-row {
        position: relative;
        //margin: 0 0.5rem;
        height: 2rem;
        line-height: 2rem;

        &:first-of-type {
          margin-bottom: 1rem;
        }
        &:last-of-type {
          margin-top: 1rem;
        }
        .block-wrapper {
          position: relative;
          transition: all 500ms;
          display: flex;
          flex-grow: 0;
          flex-shrink: 0;

          .data-block-column {
            //height: 3rem;
            color: white;
            display: flex;
            flex-direction: column;
            flex-grow: 0;
            flex-shrink: 0;
            position: relative;
            //top: 0.5rem;
            //line-height: 2rem;
            //text-align: center;
            //width: 6rem;
            background: lightgray;
            opacity: 0.25;
            //background: rgba(127, 127, 127, 0.5);
            border: 1px solid white;
            transition: all 100ms;
            z-index: 1;
            //margin: 1px;
            color: black;

            &:hover:not(.block-selected) {
              z-index: 3;
              opacity: 0.75;
            }

            &.block-present, &.block-insertion, &.block-inversion, &.block-inversion-chain, &.block-swap, &.block-cooc {
              color: white;
            }

            &.block-selected {
              opacity: 1;
              border: 1px solid black;
              z-index: 2;
            }

            &.block-present {
              background: black;
              display: block;
            }

            &.block-inversion, &.block-inversion-chain {
              display: block;
              background: #9D0D0D;
            }

            &.block-cooc {
              display: block;
              background: #0086CA;
            }

            &.block-swap {
              display: block;
              background: #8148A4;
            }

            .block-label {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              padding: 0 0.5rem;
              font-size: 0.75rem;
              z-index: 2;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }

          }
        }

        &.data-comparison-row {
          .block-wrapper {
            .data-block-column {
              &.block-insertion {
                display: block;
                background: #81CD06;
              }
            }
          }
        }
      }
    }
  }
}

</style>