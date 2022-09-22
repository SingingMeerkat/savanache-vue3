<template>
  <div class="structural-variations-table">
    <va-popover :anchor-selector="blockInfoSelector" v-model="showBlockInfo" :auto-hide="false" color="light">
      <template #body>
        <div v-html="blockInfoMessage"></div>
      </template>
    </va-popover>
    <!--    <div class="table-tabs-container">-->
    <!--      <v-tabs v-model="selectedTab" class="table-tabs d-flex">-->
    <!--        <v-tab class="elevation-2 ml-5">-->
    <!--          Millipides-->
    <!--        </v-tab>-->
    <!--        <v-tab class="elevation-2 ml-5">-->
    <!--          Pan Alignment-->
    <!--        </v-tab>-->
    <!--      </v-tabs>-->
    <!--    </div>-->
    <div class="table-container">
      <v-card tile>
        <div v-if="pivot && pivot.path && pivot.path[chromName]" class="data-area d-flex flex-row">

          <!-- "Header" column -->
          <div class="data-labels col-2 d-flex flex-column pr-0 mr-n1">

            <div v-for="assembly in beforePivotRows" :key="`assembly-header-${assembly.name}`"
                 class="data-label elevation-1 px-3">
              {{ assembly.name }}
            </div>

            <div class="data-label elevation-1 pivot-label-row px-3 d-flex">
              <div class="arrows d-flex flex-column justify-space-around">
                <a class="up-arrow" @click="movePivotUp"></a>
                <a class="down-arrow" @click="movePivotDown"></a>
              </div>
              <div class="pivot-label">
                {{ pivot.name }}
              </div>
            </div>

            <div v-for="assembly in afterPivotRows" :key="`assembly-header-${assembly.name}`"
                 class="data-label elevation-1 px-3">
              {{ assembly.name }}
            </div>

          </div>

          <!-- "Data" column rows -->
          <div class="data-block-rows col-10 d-flex flex-column pl-0 mr-1">

            <div v-for="(assembly, aIndex) in beforePivotRows" :key="`assembly-row-${assembly.name}`"
                 class="data-block-row d-flex flex-row">
              <!--              , {'selected-block': isBlockSelected(block, assembly)}-->
              <!--              @click="selectBlock(block, assembly)"-->
              <div v-for="(pivotStep, psIndex) in pivot.path[chromName]"
                   :id="`assembly-row-${assembly.name}-step-${pivotStep.panBlock}`"
                   :key="`assembly-row-${assembly.name}-step-${pivotStep.panBlock}`"
                   :class="['data-block-column', `block-${psIndex % 2}`, `elevation-1`, 'above-pivot',
                   {
                     'pivot-neighbor': aIndex === beforePivotRows.length - 1,
                     'selected': selectedBlock && selectedBlock.comparisonName === assembly.name && selectedBlock.blockName === pivotStep.panBlock,
                     'outside-range':
                     pivotStep.startPosition < positionFilter[0] ||
                     pivotStep.startPosition > positionFilter[1] // ||
                     // (
                     //
                     //   (
                     //     getVariationLength(pivotStep.panBlock, assembly.name) < lengthFilter[0] ||
                     //     getVariationLength(pivotStep.panBlock, assembly.name) > lengthFilter[1]
                     //     )
                     // ) ||
                     // isNotInSVSelection(pivotStep.panBlock, assembly.name),
                   }]"
                   @click="selectBlock(assembly.name, pivotStep.panBlock)"
                   @mouseover="selectBlockInfo(`assembly-row-${assembly.name}-step-${pivotStep.panBlock}`, assembly.name, pivotStep.panBlock)"
                   @mouseleave="selectBlockInfo()"
              >
                <!--                <div class="block-count-label">{{ // getVariationLength(pivotStep.panBlock, assembly.name) }}</div>-->
                <div v-for="blockClass in blockClasses(pivotStep.panBlock, assembly.name)"
                     :key="`assembly-row-${assembly.name}-step-${pivotStep.panBlock}-block-${blockClass}`"
                     :class="[ blockClass, 'data-block-cell']"></div>
                <!--                , `block-type-${getUpperBlock(block, assembly)}`-->
                <!--                <div :class="['data-block-cell-top']"></div>-->
                <!--                , `block-type-${getLowerBlock(block, assembly)}`-->
                <!--                <div :class="['data-block-cell-bottom']"></div>-->
              </div>
            </div>

            <div class="pivot-data-block-row d-flex flex-row">
              <div v-for="(pivotStep, psIndex) in pivot.path[chromName]"
                   :key="`pivot-row-${pivot.name}-step-${pivotStep.panBlock}`"
                   :class="[
                   'data-block-column', `pivot-block-${psIndex % 2}`, `elevation-1`,
                   {
                      'outside-range':
                     pivotStep.startPosition < positionFilter[0] ||
                     pivotStep.startPosition > positionFilter[1]
                   }]">
                <div :class="['pivot-data-block-cell']"
                     :style="{ background: pivotColor(pivotStep.panBlock, assemblies) }"></div>
              </div>
            </div>


            <div v-for="(assembly, aIndex) in afterPivotRows" :key="`assembly-row-${assembly.name}`"
                 class="data-block-row d-flex flex-row">
              <!--              , {'selected-block': isBlockSelected(block, assembly)}-->
              <!--              @click="selectBlock(block, assembly)"-->
              <div v-for="(pivotStep, psIndex) in pivot.path[chromName]"
                   :id="`assembly-row-${assembly.name}-step-${pivotStep.panBlock}`"
                   :key="`assembly-row-${assembly.name}-step-${pivotStep.panBlock}`"
                   :class="['data-block-column', `block-${psIndex % 2}`, `elevation-1`, 'below-pivot',
                   {
                     'pivot-neighbor': aIndex === 0,
                     'selected': selectedBlock && selectedBlock.comparisonName === assembly.name && selectedBlock.blockName === pivotStep.panBlock,
                     'outside-range':
                     pivotStep.startPosition < positionFilter[0] ||
                     pivotStep.startPosition > positionFilter[1]//  ||
                     // (
                     //
                     //   (
                     //     getVariationLength(pivotStep.panBlock, assembly.name) < lengthFilter[0] ||
                     //     getVariationLength(pivotStep.panBlock, assembly.name) > lengthFilter[1]
                     //     )
                     // ) ||
                     // isNotInSVSelection(pivotStep.panBlock, assembly.name),
                   }]"
                   @click="selectBlock(assembly.name, pivotStep.panBlock)"
                   @mouseover="selectBlockInfo(`assembly-row-${assembly.name}-step-${pivotStep.panBlock}`, assembly.name, pivotStep.panBlock)"
                   @mouseleave="selectBlockInfo()"

              >
                <!--                <div class="block-count-label">{{ // getVariationLength(pivotStep.panBlock, assembly.name) }}</div>-->
                <div v-for="blockClass in blockClasses(pivotStep.panBlock, assembly.name)"
                     :key="`assembly-row-${assembly.name}-step-${pivotStep.panBlock}-block-${blockClass}`"
                     :class="[ blockClass, 'data-block-cell']"></div>
                <!--                , `block-type-${getUpperBlock(block, assembly)}`-->
                <!--                <div :class="['data-block-cell-top']"></div>-->
                <!--                , `block-type-${getLowerBlock(block, assembly)}`-->
                <!--                <div :class="['data-block-cell-bottom']"></div>-->
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
// import {selectedAssemblyNames, selectedChromosome, selectedPivotName} from '@/data/some-data-source';

export default defineComponent({
  name: "StructuralVariationsPivotComparisonTable",
  components: {},
  setup() {
    const store = useStore();
    const selectedPivotName = reactiveVuex(store, "selectedPivotName", "setSelectedPivotName");
    // const selectedAssemblyNames = reactiveVuex(store, "selectedAssemblyNames", "setSelectedAssemblyNames");
    const selectedSVTypeNames = reactiveVuex(store, "selectedSVTypeNames", "setSelectedSVTypeNames");
    const selectedBlock = reactiveVuex(store, "selectedBlock", "setSelectedBlock");
    const chromName = reactiveVuex(store, "chromOnDisplay", "setChromOnDisplay");

    const lengthFilter = reactiveVuex(store, "lengthFilter", "setLengthFilter"); // ref((Math.round(limitLength * 0.01) / lengthStep) * lengthStep);
    const positionFilter = reactiveVuex(store, "positionFilter", "setPositionFilter"); // ref((Math.round(limitPosition * 0.01) / positionStep) * positionStep);

    const assembliesSelectedStored = computed(() => {
      // selectedItems.value = store.getters['assemblies/assembliesSelected'].map(assembly => assembly.assembly_name);
      return store.getters["assemblies/assembliesSelected"];
    });

    const showBlockInfo = ref(false);
    const blockInfoSelector = ref('');
    const blockInfoMessage = ref('');
    const selectBlockInfo = (id, assemblyName, panBlock) => {
      console.log('id', id);
      if (!id || !assemblyName || !panBlock) {
        showBlockInfo.value = false;
      } else {
        const block = pivots.value[selectedPivotName.value][assemblyName].blocks[panBlock];
        // eslint-disable-next-line no-unused-vars
        const pivotStart = block.pivotStepIndex !== undefined ? pangenome.value.paths[selectedPivotName.value][chromName.value][block.pivotStepIndex].startPosition : undefined;
        // eslint-disable-next-line no-unused-vars
        const comparisonStart = block.comparedPathStepIndex !== undefined ? pangenome.value.paths[selectedPivotName.value][chromName.value][block.comparedPathStepIndex].startPosition : undefined;
        // eslint-disable-next-line no-unused-vars
        const blockLength = pangenome.value.panSkeleton[panBlock].length;
        blockInfoMessage.value = `${panBlock}`;

        if (block.present) {
          blockInfoMessage.value += `<br>Present`;
        } else {
          blockInfoMessage.value += `<br>Absent`;
        }
        if (block.inversion && !block.inversionChain) {
          blockInfoMessage.value += `<br>Inversion`;
        } else if (block.inversionChain) {
          blockInfoMessage.value += `<br>Inversion chain: ${block.inversionChainNodes.map(n => n.comparedPathStepPanBlock).join(', ')}`;
        }
        if (block.insertion) {
          blockInfoMessage.value += `<br>Insertion${block.insertionNodes.length > 1 ? 's' : ''}: ${block.insertionNodes.map(n => n.comparedPathStepPanBlock).join(', ')}`;
        }
        if (block.swap) {
          blockInfoMessage.value += `<br>${selectedPivotName.value} swap: ${block.swapPivotNodes.map(n => n.pivotStepPanBlock).join(', ')}`;
          blockInfoMessage.value += `<br>${assemblyName} swap: ${block.swapComparedNodes.map(n => n.comparedPathStepPanBlock).join(', ')}`;
        }
        if (block.cooc) {
          blockInfoMessage.value += `<br>Co-occurrence${block.coocNodes.length > 1 ? 's' : ''}: ${block.coocNodes.map(n => n.comparedPathStepPanBlock).join(', ')}`;
        }
        if (pivotStart !== undefined) {
          blockInfoMessage.value += `<br>${selectedPivotName.value} start: ${pivotStart.toLocaleString()}`;
        }
        if (comparisonStart !== undefined) {
          blockInfoMessage.value += `<br>${assemblyName} start: ${comparisonStart.toLocaleString()}`;
        }
        blockInfoMessage.value += `<br>Length: ${blockLength.toLocaleString()}`;
        blockInfoSelector.value = '#' + id;
        showBlockInfo.value = true;
      }
    }

    const pangenome = ref();
    const pivots = ref();
    const paths = ref({});

    watch(chromName, () => {
      getData(chromName.value).then((data) => {
        if (data) {
          pangenome.value = data.pangenome;
          pivots.value = data.pivots[chromName.value];
          //pivots.value = data.pivots;

          const pathNames = Object.keys(pangenome.value.paths);

          paths.value = pathNames.reduce((result, pathName) => ({
            ...result,
            [pathName]: data.pangenome.paths[pathName]
          }), {});
        }
      });
    });

    const pivotRowIndex = ref(1);

    const selectedAssemblyKeyNames = computed(() => {
      return assembliesSelectedStored.value.reduce((output, input) => ({ ...output, [input.assembly_name]: true }), {});
    });

    const pivot = computed(() => ({ name: selectedPivotName.value, path: paths.value[selectedPivotName.value] }));
    const assemblies = computed(() => Object.keys(paths.value).filter(pathName => selectedAssemblyKeyNames.value[pathName]).map(pathName => ({
      name: pathName,
      path: paths.value[pathName]
    })));

    const getBlock = (nodeName, pathName) => {
      if (pivots.value) {
        const nodes = pivots.value[selectedPivotName.value];
        if (nodes) {
          const pathData = nodes[pathName];
          if (pathData && pathData.blocks) {
            const node = pathData.blocks[nodeName];
            return node;
          }
        }
      }
    };

    const getVariationLength = (nodeName, pathName) => {
      const block = getBlock(nodeName, pathName);
      return block.variationLength;
    };


    const isNotInSVSelection = (nodeName, pathName) => {
      if (!selectedSVTypeNames.value || !selectedSVTypeNames.value.length) {
        return false;
      }
      const block = getBlock(nodeName, pathName);
      const found = Object.entries(block).filter((entry) => !!entry[1]).find((entry) => selectedSVTypeNames.value.includes(entry[0]));
      return !found;
    };

    // const ispresent = (pivotName, nodeName, pathName) => {
    //   const pathBlock = getBlock(pivotName, nodeName, pathName);
    //   console.log("ispresent", pivotName, nodeName, pathName, pathBlock && pathBlock.present);
    //   return pathBlock && pathBlock.present;
    // };

    const pivotColor = (nodeName, paths) => {
      const blocks = paths.map(path => getBlock(nodeName, path.name));
      const presentCount = blocks.reduce((result, block) => {
        if (block && block.present) {
          result++;
        }
        return result;
      }, 0);
      const totalCount = blocks.length;
      const percentpresent = (presentCount / totalCount);
      const presentColor = {
        red: 236,
        green: 135,
        blue: 1
      };
      const absentColor = {
        red: 0,
        green: 159,
        blue: 236
      };
      const colors = {
        red: ((presentColor.red - absentColor.red) * percentpresent) + (absentColor.red),
        green: ((presentColor.green - absentColor.green) * percentpresent) + (absentColor.green),
        blue: ((presentColor.blue - absentColor.blue) * percentpresent) + (absentColor.blue)
      };
      return `rgb(${colors.red}, ${colors.green}, ${colors.blue}`;
    };

    const blockClasses = (nodeName, pathName) => {
      const pathBlock = getBlock(nodeName, pathName);
      const cssClasses = [`block-${nodeName}`];
      if (pathBlock) {
        if (pathBlock.present) {
          cssClasses.push(`block-present`);
        }
        if (pathBlock.cooc && (selectedSVTypeNames.value.length === 0 || selectedSVTypeNames.value.includes('cooc'))) {
          cssClasses.push(`block-cooc`);
        }
        if (pathBlock.swap && (selectedSVTypeNames.value.length === 0 || selectedSVTypeNames.value.includes('swap'))) {
          if (typeof pathBlock.swap === 'string') {
            cssClasses.push(`block-swap-${pathBlock.swap}`);
          } else {
            cssClasses.push(`block-swap`);
          }
        }
        if (pathBlock.insertion && (selectedSVTypeNames.value.length === 0 || selectedSVTypeNames.value.includes('insertion'))) {
          cssClasses.push(`block-insertion`);
        }
        if (pathBlock.inversion && !pathBlock.inversionChain && (selectedSVTypeNames.value.length === 0 || selectedSVTypeNames.value.includes('inversion'))) {
          cssClasses.push(`block-inversion`);
        }
        if (pathBlock.inversionChain && (selectedSVTypeNames.value.length === 0 || selectedSVTypeNames.value.includes('inversionChain'))) {
          if (typeof pathBlock.inversionChain === 'string') {
            cssClasses.push(`block-inversionChain-${pathBlock.inversionChain}`);
          } else {
            cssClasses.push(`block-inversionChain`);
          }
        }
      }
      return cssClasses;
    };

    const beforePivotRows = computed(() => assemblies.value.slice(0, pivotRowIndex.value));
    const afterPivotRows = computed(() => assemblies.value.slice(pivotRowIndex.value));

    const movePivotUp = () => (pivotRowIndex.value > 0) ? pivotRowIndex.value-- : undefined;
    const movePivotDown = () => (pivotRowIndex.value < assemblies.value.length) ? pivotRowIndex.value++ : undefined;

    const selectBlock = (comparisonName, blockName) => {
      selectedBlock.value = { pivotName: selectedPivotName.value, comparisonName, blockName };
      // console.log("selectedBlock", selectedBlock.value);
    };

    return {
      chromName,
      pivot,
      assemblies,
      blockClasses,
      pivotColor,
      pivotRowIndex,
      beforePivotRows,
      afterPivotRows,
      movePivotUp,
      movePivotDown,
      selectedBlock,
      selectBlock,

      lengthFilter,

      positionFilter,

      getBlock,

      getVariationLength,

      isNotInSVSelection,

      showBlockInfo,
      blockInfoSelector,
      blockInfoMessage,
      selectBlockInfo,
    };
  }
});
</script>

<style lang="scss" scoped>

.arrows {
  position: absolute;
  height: 100%;
  left: 0.25rem;
  padding: 0.125rem 0;
}

.up-arrow, .down-arrow {
  display: block;
}

.up-arrow {
  width: 0;
  height: 0;
  border-left: 0.3rem solid transparent;
  border-right: 0.3rem solid transparent;

  border-bottom: 0.5rem solid #aaa;

}

.down-arrow {
  width: 0;
  height: 0;
  border-left: 0.3rem solid transparent;
  border-right: 0.3rem solid transparent;

  border-top: 0.5rem solid #aaa;

}

.structural-variations-table {
}

.table-tabs-container {
  .table-tabs {
    ::v-deep .v-item-group.v-slide-group.v-tabs-bar {

    }

    ::v-deep .v-slide-group__wrapper {
      padding-top: 1rem;
      margin-top: -1rem;
    }

    ::v-deep .v-slide-group__content.v-tabs-bar__content {
      padding-right: 1rem;
    }

    ::v-deep .v-item-group {
    }
  }
}

.data-area {
  overflow: auto;
}

.data-label {
  line-height: 3rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.data-block-rows {
  overflow: auto;
}


.data-block-column {
  position: relative;

  width: 1.5rem;
  height: 3rem;
  background: #eee;
  border: 1px solid transparent;

  flex-grow: 0;
  flex-shrink: 0;

  &.block-1 {
    background: white;
    //border: 1px solid white;

    .data-block-cell-top, .data-block-cell-bottom {
    }
  }

  .pivot-data-block-cell {
    width: calc(1.5rem - 2px);
    height: calc(3rem - 2px);
  }

  &:hover {
    border-color: rgba(0, 255, 255, 1);
    background-color: rgba(0, 255, 255, 0.75);
  }

  &.selected {
    border-color: rgba(0, 255, 0, 1);
    background-color: rgba(0, 255, 0, 0.75);
  }
}


.pivot-label-row {
  position: relative;
  line-height: 2rem !important;
}

.pivot-data-block-row {
  .data-block-column {
    &:hover {
      border-color: transparent;
    }

    height: 2rem;

    .pivot-data-block-cell {
      height: calc(2rem - 2px);
    }
  }
}


.data-block-row {
  overflow: visible;

  .data-block-column {
    //border: 1px solid #eee;
    overflow: visible;

    &.above-pivot {
      transform: scaleY(-100%);
    }

    &.below-pivot {

    }

    &.pivot-neighbor {
      .block-cooc {
        transform: scaleY(-100%);
      }
    }

    .data-block-cell {
      display: block;
      width: calc(1.5rem - 2px);
      height: calc(1.5rem - 2px);

      position: absolute;
      overflow: visible;


      &.block-present {
        background: black;
        bottom: 0;
      }

      &.block-cooc {
        bottom: 50%;
        background: #0086CA;
        border-radius: 1rem 1rem 0 0;
      }

      &.block-insertion {
        bottom: 50%;
        left: -0.3rem;
        width: 0;
        height: 0;
        border-left: 0.25rem solid transparent;
        border-right: 0.25rem solid transparent;
        border-bottom: 1rem solid #81CD06;
        z-index: 1;
      }

      &.block-swap-start {
        //background: red;
        //background: green;
        right: 0;
        left: 0;
        bottom: 0.2rem;
        //width: 0;
        height: 0;
        border-top: 0.5rem solid transparent;
        border-bottom: 0.5rem solid transparent;

        border-left: 0.5rem solid #8148A4;
        //transform: translateY(10%);
      }

      &.block-swap-end {
        //background: red;
        //background: green;
        right: 0;
        left: 0;
        bottom: 0.2rem;
        //width: 0;
        height: 0;
        border-top: 0.5rem solid transparent;
        border-bottom: 0.5rem solid transparent;

        border-right: 0.5rem solid #8148A4;
        //transform: translateY(10%);
      }

      &.block-swap-solo {
        //background: red;
        //background: green;
        right: 0;
        left: 0;
        bottom: 0.2rem;
        //width: calc(100%);
        height: 0;
        border-top: 0.5rem solid transparent;
        border-bottom: 0.5rem solid transparent;

        border-left: 0.5rem solid #8148A4;
        border-right: 0.5rem solid #8148A4;
        //transform: translateY(10%);
      }

      &.block-inversion {
        left: 0.2rem;
        bottom: 50%;
        width: 0;
        height: 0;
        border-left: 0.5rem solid transparent;
        border-right: 0.5rem solid transparent;

        border-bottom: 0.5rem solid #9D0D0D;
      }


      &.block-inversionChain, &.block-inversionChain-start, &.block-inversionChain-end {
        //left: 0.2rem;

        bottom: 50%;

        height: 50%;
        //border-left: 0.5rem solid transparent;
        //border-right: 0.5rem solid transparent;

        //border-bottom: 0.5rem solid #9D0D0D;
        //border-bottom: 0.125rem solid #9D0D0D;
        z-index: 1;

        &::before, &::after {
          display: block;
          content: "";
          position: absolute;
          bottom: 0;
        }

      }


      &.block-inversionChain::before {
        left: -1px;
        right: -1px;
        //width: calc(100% + 2px);
        border-bottom: 0.2rem solid #9D0D0D;
      }

      &.block-inversionChain-start::before {
        left: 50%;
        right: -1px;
        border-bottom: 0.2rem solid #9D0D0D;
      }

      &.block-inversionChain-end::before {
        left: -1px;
        right: 50%;
        border-bottom: 0.2rem solid #9D0D0D;
      }

      &.block-inversionChain::after, &.block-inversionChain-start::after, &.block-inversionChain-end::after {
        display: block;
        content: "";
        position: absolute;
        left: 0.2rem;
        bottom: 0;

        border-left: 0.5rem solid transparent;
        border-right: 0.5rem solid transparent;

        border-bottom: 0.5rem solid #9D0D0D;
      }

    }


  }
}

.outside-range {
  //opacity: 0.1;
  display: none;
}

.block-count-label {
  position: absolute;
  font-size: 0.5rem;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.above-pivot {
  .block-count-label {
    transform: translate(-50%, -50%) scaleY(-100%);
  }
}

</style>