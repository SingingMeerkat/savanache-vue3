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
                     :class="['data-block-column', `block-${asIndex % 2}`, ...assemblyStep.blockClasses.map(style => `block-style-${style.toLowerCase()}`), ...assemblyStep.blockTypes.map(style => `block-type-${style.toLowerCase()}`)]"
                     :style="assemblyStep.blockStyles"
                >
                  <!--                  <div :class="[`assembly-block`, `block-type`, `block-type-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in assemblyStep.blockTypes" :key="`assembly-${assemblyName}-step-${assemblyStep.name}-block-type-text-${blockType}-${asIndex}-${btIndex}`">-->
                  <!--                  </div>-->
                  <div class="block-label">
                    {{ assemblyStep.name }}
                  </div>
                  <!--                  <div :class="[`assembly-block`, `block-text`, `block-type-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in assemblyStep.blockTypes" :key="`assembly-${assemblyName}-step-${assemblyStep.name}-block-type-${blockType}-${asIndex}-${btIndex}`">-->
                  <!--                    [{{ blockType }}]-->
                  <!--                  </div>-->
                </div>
              </div>
            </div>

            <div class="data-block-row d-flex flex-row">
              <div v-for="(visualStep, vsIndex) in visualSteps"
                   :key="`visual-row-step-${visualStep.name}-${vsIndex}`"
                   :class="['visual-block', 'data-block-column', `block-${vsIndex % 2}`, `elevation-1`, ...visualStep.blockClasses.map(style => `block-style-${style.toLowerCase()}`)]"
                   :style="visualStep.blockStyles"
              >
                <div v-for="(blockType, btIndex) in visualStep.blockTypes"
                     :key="`visual-step-${visualStep.name}-block-type-text-${blockType}-${vsIndex}-${btIndex}`"
                     :class="[`visual-block`, `block-type`, `block-type-${blockType.toLowerCase()}`]">
                </div>
              </div>
            </div>

            <div class="data-block-row d-flex flex-row">
              <div :style="{ left: pivotOffset+'px' }" class="block-wrapper">
                <div v-for="(pivotStep, psIndex) in pivotSteps"
                     :key="`pivot-row-${pivotName}-step-${pivotStep.name}-${psIndex}`"
                     :class="['data-block-column', `block-${psIndex % 2}`, ...pivotStep.blockClasses.map(style => `block-style-${style.toLowerCase()}`), ...pivotStep.blockTypes.map(style => `block-type-${style.toLowerCase()}`)]"
                     :style="pivotStep.blockStyles"
                >
                  <!--                  <div :class="[`pivot-block`, `block-type`, `block-type-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in pivotStep.blockTypes" :key="`pivot-${pivotName}-step-${pivotStep.name}-block-type-text-${blockType}-${psIndex}-${btIndex}`">-->
                  <!--                  </div>-->
                  <div class="block-label">
                    {{ pivotStep.name }}
                  </div>
                  <!--                  <div :class="[`pivot-block`, `block-text`, `block-type-${blockType.toLowerCase()}`]" v-for="(blockType, btIndex) in pivotStep.blockTypes" :key="`pivot-${pivotName}-step-${pivotStep.name}-block-type-${blockType}-${psIndex}-${btIndex}`">-->
                  <!--                    [{{ blockType }}]-->
                  <!--                  </div>-->

                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>

import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { reactiveVuex } from "@/store/helper";
import { calculateOffset, isSelectedStep, newVisualStep } from "@/helpers/pivot-details";
// import {selectedAssemblies, selectedChromosome, selectedPivot} from '@/data/some-data-source';

export default defineComponent({
  name: "StructuralVariationsPivotDetails",
  components: {},
  setup() {
    const store = useStore();
    const selectedPivot = reactiveVuex(store, "selectedPivot", "setSelectedPivot");
    const selectedAssemblies = reactiveVuex(store, "selectedAssemblies", "setSelectedAssemblies");
    const selectedSVs = reactiveVuex(store, "selectedSVs", "setSelectedSVs");
    const selectedBlock = reactiveVuex(store, "selectedBlock", "setSelectedBlock");

    const paths = ref({});
    const pangenome = ref();
    const pivots = ref();

    getData().then((data) => {
      if (data) {
        pangenome.value = data.pangenome;
        pivots.value = data.pivots;

        const pathNames = Object.keys(pangenome.value.paths);

        paths.value = pathNames.reduce((result, pathName) => ({
          ...result,
          [pathName]: data.pangenome.paths[pathName]
        }), {});
      }
    });

    const pivotSteps = ref([]);
    const assemblySteps = ref([]);
    const visualSteps = ref([]);

    const assemblyOffset = ref(0);
    const pivotOffset = ref(0);

    const colors = {};
    const tops = {};

    watch(selectedBlock, () => {
      pivotSteps.value = [];
      assemblySteps.value = [];
      visualSteps.value = [];

      const selectedBlockPivotPath = pangenome.value.paths[selectedBlock.value.pivot];

      const selectedBlockAssemblyPath = pangenome.value.paths[selectedBlock.value.assembly];

      assemblyOffset.value = 0;
      pivotOffset.value = 0;

      selectedBlockPivotPath.steps.forEach(step => {
        const panBlock = pangenome.value.panSkeleton[step.panBlock];
        const otherIndex = panBlock.traversals[selectedBlock.value.assembly];

        const otherPanBlock = selectedBlockAssemblyPath.steps[otherIndex];

        const pivotPathNodes = pivots.value[selectedBlock.value.pivot];

        const pivotPathNode = pivotPathNodes[step.panBlock][selectedBlock.value.assembly];

        const blockTypes = pivotPathNode ? Object.entries(pivotPathNode).filter(([key, value]) => value && typeof value !== "object" && key !== "Insertion").map(([key]) => key) : [];

        const offsets = calculateOffset({
          step,
          otherPanBlock,
          selectedBlock
        });

        assemblyOffset.value = offsets.assemblyOffset;
        pivotOffset.value = offsets.pivotOffset;

        const selected = isSelectedStep({
          step,
          selectedBlock,
          reversePanBlock: null,
          panBlock: null
        });

        const pivotStep = newVisualStep({
          step,
          blockTypes,
          selected,
          panBlock
        });

        pivotSteps.value.push(pivotStep);
      });

      if (selectedBlockAssemblyPath) {
        selectedBlockAssemblyPath.steps.forEach(step => {

          const panBlock = pangenome.value.panSkeleton[step.panBlock];

          const otherIndex = panBlock.traversals[selectedBlock.value.pivot];

          const otherPanBlock = selectedBlockPivotPath.steps[otherIndex];

          const lastStep = assemblySteps.value[assemblySteps.value.length - 1];

          let pivotPathNode = null;
          let reversePanBlock = "";

          const pivotPathNodes = pivots.value[selectedBlock.value.pivot];

          if (pivotPathNodes[step.panBlock]) {

            // Make it so the block that has the "insert" property on it, doesn't show up as "the" insert (the block before it should show up as the insert)
            pivotPathNode = { ...pivotPathNodes[step.panBlock][selectedBlock.value.assembly], Insertion: undefined };
          } else {
            // Grab all the kinds of structural variations on the pivot (They are key:value pairs, either boolean, or string (start, end, etc.))
            Object.entries(pivots.value[selectedBlock.value.pivot]).every(([key, value]) => {
              const thing = value[selectedBlock.value.assembly];
              if (thing.Nodes && thing.Nodes.includes(step.panBlock)) {
                reversePanBlock = key;
                pivotPathNode = { ...thing, cooccurrence: undefined };
                return selectedBlock.value.block !== key;
              }
              return true;
            });
          }
          const blockTypes = pivotPathNode ? Object.entries(pivotPathNode).filter(([key, value]) => value && typeof value !== "object").map(([key, value]) => key) : [];

          if (panBlock.cooccurrences.length && !blockTypes.includes("cooccurrence")) {
            blockTypes.push("cooccurrence");
          }

          const selected = isSelectedStep({
            step,
            selectedBlock,
            reversePanBlock,
            panBlock
          });

          const assemblyStep = newVisualStep({
            step,
            blockTypes,
            selected,
            panBlock
          });

          assemblySteps.value.push(assemblyStep);
        });
      }
    });


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
      pivotOffset
    };
  }
});
</script>

<style lang="scss" scoped>

.data-area {
  //overflow: auto;
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
  //display: inline-block;
  //position: relative;
  position: absolute;
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

.block-type-present {
  background: black;
  color: white;
}

.block-type-insertion {
  background: #81CD06 !important;
  color: black;
}

.block-type-inversion, .block-type-inversionchain {
  background: #9D0D0D !important;
  color: white;
}

.block-type-cooccurrence {
  background: #0086CA !important;
  color: white;
}

.block-type-swap {
  background: #8148A4 !important;
  color: white;
}

.block-type-inversion.block-type-cooccurrence, .block-type-inversionchain.block-type-cooccurrence {
  background: linear-gradient(0deg, #0086CA 50%, #9D0D0D 50%) !important;
}

.block-type-swap.block-type-cooccurrence {
  background: linear-gradient(0deg, #0086CA 50%, #8148A4 50%) !important;
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

.visual-block.block-type.block-type-cooccurrence {
  position: absolute;
  //width: 100%;
  left: -1px;
  right: -1px;
  height: 0;
  top: 50%;
  transform: translateY(-50%);
  border-bottom: 2px solid #0086CA;
}

.pivot-block.block-type.block-type-cooccurrence {
  position: absolute;
  height: calc(50% + 1px);
  left: 50%;
  top: calc(-50% - 1px);
  transform: translateX(-50%);
  border-left: 2px solid #0086CA;
}

.assembly-block.block-type.block-type-cooccurrence {
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

  .visual-block.block-type.block-type-cooccurrence {
    border-bottom-style: dashed;
  }
}

.block-style-selected {
  border: 1px solid black;
  z-index: 2;
  opacity: 1;
}

.visual-block {
  border: 0 none;
  height: 100%;
  transform: translateY(-50%);
}

.block-wrapper {
  position: absolute;
  transition: all 500ms;
  //white-space: nowrap;
}

</style>