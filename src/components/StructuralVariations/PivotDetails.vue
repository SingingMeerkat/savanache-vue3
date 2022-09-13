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
            <div v-for="(comparisonStep, index) in selectedComparisonSteps"
                 :key="`comparison-row-${selectedBlock.comparisonName}-step-${comparisonStep.panBlockName}`"
                 :class="['data-block-column', `block-${index % 2}`]"
                 :style="{width: comparisonStep.length + 'px'}"
            >
              <!--              :class="['data-block-column', `block-${index % 2}`, ...comparisonStep.nodeTypeClasses.map(cls => `block-${cls}`)]"-->
              <div class="block-label">{{ comparisonStep.panBlockName }}</div>
              <div v-for="nodeTypeClass in comparisonStep.nodeTypeClasses" :key="`comparison-row-${selectedBlock.comparisonName}-step-${comparisonStep.panBlockName}-${nodeTypeClass}`" :class="['block-type', `block-${nodeTypeClass}`]"></div>
            </div>
          </div>
        </div>

        <div class="data-block-row d-flex flex-row">
          <div :style="{ left: pivotOffset+'px' }" class="block-wrapper">
            <div v-for="(pivotStep, index) in selectedPivotSteps"
                 :key="`pivot-row-${selectedBlock.pivotName}-step-${pivotStep.panBlockName}`"
                 :class="['data-block-column', `block-${index % 2}`]"
                 :style="{width: pivotStep.length + 'px'}"
            >
              <!--              :class="['data-block-column', `block-${index % 2}`, ...pivotStep.nodeTypeClasses.map(cls => `block-${cls}`)]"-->
              <div class="block-label">{{ pivotStep.panBlockName }}</div>
              <div v-for="nodeTypeClass in pivotStep.nodeTypeClasses" :key="`pivot-row-${selectedBlock.pivotName}-step-${pivotStep.panBlockName}-${nodeTypeClass}`" :class="['block-type', `block-${nodeTypeClass}`]"></div>
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

    let comparisonStepKeys = {};

    const makeComparisonNode = ({currentPivotStep, block, comparisonPath, pivotBlock, type}) => {
      if (!currentPivotStep.nodeTypeClasses.includes(type)) {
        currentPivotStep.nodeTypeClasses.push(type);
      }
      const compareNode = comparisonPath[block.comparedPathStepIndex];
      if (compareNode) {
        const comparisonStep = comparisonStepKeys[compareNode.panBlock] || {
          pivotStepIndex: pivotBlock.pivotStepIndex,
          comparedPathStepIndex: block.comparedPathStepIndex,
          pivotPanBlockName: pivotBlock.panBlock,
          panBlockName: compareNode.panBlock,
          comparisonName: selectedBlock.value.comparisonName,
          start: compareNode.startPosition,
          end: compareNode.endPosition,
          length: compareNode.endPosition - compareNode.startPosition,
          nodeTypeClasses: [type],
        };
        comparisonStepKeys[compareNode.panBlock] = comparisonStep;
        if (!selectedComparisonSteps.value.includes(comparisonStep)) {
          selectedComparisonSteps.value.push(comparisonStep);
        }
        if (!comparisonStep.nodeTypeClasses.includes(type)) {
          comparisonStep.nodeTypeClasses.push(type);
        }
        if (pivotBlock.panBlock === selectedBlock.value.blockName && !comparisonStep.nodeTypeClasses.includes('selected')) {
          comparisonStep.nodeTypeClasses.push('selected');
        }
        if (pivotBlock.panBlock === selectedBlock.value.blockName && !comparisonStep.nodeTypeClasses.includes('selected-' + type)) {
          comparisonStep.nodeTypeClasses.push('selected-' + type);
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


      pivotSection.forEach(pivotNode => {
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
        const pivotBlock = pivotDefinition.blocks[pivotNode.panBlock];

        const currentPivotStep = {
          pivotStepIndex: pivotBlock.pivotStepIndex,
          panBlockName: pivotBlock.panBlock,
          pivotName: selectedBlock.value.pivotName,
          start: pivotNode.startPosition,
          end: pivotNode.endPosition,
          length: pivotNode.endPosition - pivotNode.startPosition,
          nodeTypeClasses: [],
        };
        selectedPivotSteps.value.push(currentPivotStep);
        if (pivotBlock.panBlock === selectedBlock.value.blockName) {
          currentPivotStep.nodeTypeClasses.push('selected');
        }

        // Present
        if (pivotBlock.comparedPathStepIndex !== undefined) {
          makeComparisonNode({currentPivotStep, block: pivotBlock, comparisonPath, pivotBlock, type: 'present'});
        }

        // Deleted
        if (pivotBlock.deletedNodes && pivotBlock.deletedNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.deletedNodes, comparisonPath, pivotBlock, type: 'deleted'});
        }

        // Inversion
        if (pivotBlock.inversionNodes && pivotBlock.inversionNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.inversionNodes, comparisonPath, pivotBlock, type: 'inversion'});
        }

        // Swap
        if (pivotBlock.swapComparedNodes && pivotBlock.swapComparedNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.swapComparedNodes, comparisonPath, pivotBlock, type: 'swap'});
        }

        // Insertion
        if (pivotBlock.insertionNodes && pivotBlock.insertionNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.insertionNodes, comparisonPath, pivotBlock, type: 'insertion'});
        }

        // InversionChain
        if (pivotBlock.inversionChainNodes && pivotBlock.inversionChainNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.inversionChainNodes, comparisonPath, pivotBlock, type: 'inversion-chain'});
        }

        // Cooc
        if (pivotBlock.coocNodes && pivotBlock.coocNodes.length) {
          makeComparisonNodeList({currentPivotStep, blocks: pivotBlock.coocNodes, comparisonPath, pivotBlock, type: 'cooc'});
        }

      });

      selectedComparisonSteps.value = selectedComparisonSteps.value.sort((a, b) => a.comparedPathStepIndex - b.comparedPathStepIndex);
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
    const scrollOffset = ref(0);

    return {
      selectedPivotSteps,
      selectedComparisonSteps,

      selectedBlock,

      comparisonOffset,
      pivotOffset,
      scrollOffset,

      dataBlockRowsRef
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
      overflow: auto;
      width: 100%;
      .data-block-row {
        position: relative;
        margin: 0 0.5rem;
        height: 3rem;
        line-height: 3rem;

        .block-wrapper {
          position: relative;
          transition: all 500ms;
          display: flex;
          flex-grow: 0;
          flex-shrink: 0;

          .data-block-column {
            //height: 3rem;
            display: flex;
            flex-grow: 0;
            flex-shrink: 0;
            position: relative;
            //top: 0.5rem;
            //line-height: 2rem;
            //text-align: center;
            //width: 6rem;
            background: lightgray;
            //opacity: 0.25;
            //background: rgba(127, 127, 127, 0.5);
            border: 1px solid white;
            transition: all 100ms;
            z-index: 1;

            //&:hover:not(.block-style-selected) {
            //  z-index: 3;
            //  //opacity: 0.75;
            //}

            .block-label {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              padding: 0 0.5rem;
              font-size: 0.75rem;
              z-index: 2;
            }

            .block-type {
              //position: absolute;
              z-index: 1;
              flex-grow: 1;
              flex-shrink: 1;
              width: 100%;
              height: 100%;
              opacity: 0.25;

              &.block- {

                &selected {
                  position: absolute;
                  left: 0;
                  top: 0;
                  border: 1px solid black;
                  z-index: 2;
                  opacity: 1;
                }

                &present {
                  position: absolute;
                  left: 0;
                  top: 0;
                  background: black;
                  color: white;
                }

                &insertion {
                  background: #81CD06;
                  color: black;
                }

                &inversion, &inversion-chain {
                  background: #9D0D0D;
                  color: white;
                }

                &cooc {
                  background: #0086CA;
                  color: white;
                }

                &swap {
                  background: #8148A4;
                  color: white;
                }
              }

              &selected- {
                &present {
                  background: black;
                  color: white;
                  opacity: 1;
                }

                &insertion {
                  background: #81CD06;
                  color: black;
                  opacity: 1;
                }

                &inversion, &inversion-chain {
                  background: #9D0D0D;
                  color: white;
                  opacity: 1;
                }

                &cooc {
                  background: #0086CA;
                  color: white;
                  opacity: 1;
                }

                &swap {
                  background: #8148A4;
                  color: white;
                  opacity: 1;
                }
              }

            }
          }
        }
      }
    }
  }
}

</style>