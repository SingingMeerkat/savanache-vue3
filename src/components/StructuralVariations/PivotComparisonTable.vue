<template>
  <div class="structural-variations-table">
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
        <div v-if="pivot && pivot.path && pivot.path.steps" class="data-area d-flex flex-row">

          <!-- "Header" column -->
          <div class="data-labels col-2 d-flex flex-column pr-0 mr-n1">

            <div class="data-label elevation-1 px-3 mb-1">
              {{ pivot.name }}
            </div>

            <div v-for="assembly in assemblies" :key="`assembly-header-${assembly.name}`"
                 class="data-label elevation-1 px-3 mb-1">
              {{ assembly.name }}
            </div>

          </div>

          <!-- "Data" column rows -->
          <div class="data-block-rows col-10 d-flex flex-column pl-0 mr-1">


            <div class="pivot-data-block-row d-flex flex-row mb-1">
              <div v-for="(pivotStep, psIndex) in pivot.path.steps"
                   :key="`pivot-row-${pivot.name}-step-${pivotStep.panBlock}`"
                   :class="['data-block-column', `pivot-block-${psIndex % 2}`, `elevation-1`]">
                <div :class="['pivot-data-block-cell']" :style="{ background: pivotColor(pivot.name, pivotStep.panBlock, assemblies) }"></div>
              </div>
            </div>


            <div v-for="assembly in assemblies" :key="`assembly-row-${assembly.name}`"
                 class="data-block-row d-flex flex-row mb-1">
              <!--              , {'selected-block': isBlockSelected(block, assembly)}-->
              <!--              @click="selectBlock(block, assembly)"-->
              <div v-for="(pivotStep, psIndex) in pivot.path.steps"
                   :key="`assembly-row-${assembly.name}-step-${pivotStep.panBlock}`"
                   :class="['data-block-column', `block-${psIndex % 2}`, `elevation-1`]">
                <div v-for="blockClass in blockClasses(pivot.name, pivotStep.panBlock, assembly.name)"
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

<script lang="ts">

import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { PangenomeJson, Path, Paths } from "@/interfaces/pangenome-json";
import { PathNode, Pivot, PivotJson, PivotNode } from "@/interfaces/pivot-json";
// import {selectedAssemblies, selectedChromosome, selectedPivot} from '@/data/some-data-source';

export default defineComponent({
  name: "StructuralVariationsPivotComparisonTable",
  components: {},
  setup() {
    const store = useStore();

    const selectedPivot = computed<string>({
      get: () => store.state.selectedPivot,
      set: (value) => store.commit("setSelectedPivot", value)
    });
    const selectedAssemblies = computed<{ [k: string]: boolean }>(() => store.state.selectedAssemblies);

    const paths = ref<{ [k: string]: Path }>({});
    const pangenome = ref<PangenomeJson>();
    const pivots = ref<PivotJson>();

    getData().then((data) => {
      if (data) {
        pangenome.value = data.pangenome;
        pivots.value = data.pivots;

        const pathNames = Object.keys(pangenome.value.paths) as Array<keyof Paths>;

        paths.value = pathNames.reduce((result, pathName) => ({
          ...result,
          [pathName]: data.pangenome.paths[pathName]
        }), {});
      }
    });

    const pivot = computed(() => ({ name: selectedPivot.value, path: paths.value[selectedPivot.value] }));
    const assemblies = computed(() => Object.keys(paths.value).filter(pathName => selectedAssemblies.value[pathName]).map(pathName => ({
      name: pathName,
      path: paths.value[pathName]
    })));

    const getBlock = (pivotName: keyof PivotJson, nodeName: keyof Pivot, pathName: keyof PivotNode): PathNode | undefined => {
      if (pivots.value) {
        const nodes = pivots.value[pivotName];
        if (nodes) {
          const node = nodes[nodeName];
          if (node) {
            const pathBlock = node[pathName];
            return pathBlock;
          }
        }
      }
    }

    const isPresent = (pivotName: keyof PivotJson, nodeName: keyof Pivot, pathName: keyof PivotNode): boolean | undefined => {
      const pathBlock = getBlock(pivotName, nodeName, pathName);
      console.log('isPresent', pivotName, nodeName, pathName, pathBlock && pathBlock.Present);
      return pathBlock && pathBlock.Present;
    }

    const pivotColor = (pivotName: keyof PivotJson, nodeName: keyof Pivot, paths: Array<{  name: keyof PivotNode }>) => {
      const blocks = paths.map(path => getBlock(pivotName, nodeName, path.name));
      const presentCount = blocks.reduce((result, block) => {
        if (block && block.Present) {
          result++;
        }
        return result;
      }, 0);
      const totalCount = blocks.length;
      const colors = {
        red: Math.min(511 * (1 - (presentCount / totalCount)), 255),
        green: Math.min(511 * (presentCount / totalCount), 255),
        blue: 0,
      };
      return `rgb(${colors.red}, ${colors.green}, ${colors.blue}`;
    };

    const blockClasses = (pivotName: keyof PivotJson, nodeName: keyof Pivot, pathName: keyof PivotNode) => {
      const pathBlock = getBlock(pivotName, nodeName, pathName);
      const cssClasses = [`block-${nodeName}`];
      if (pathBlock) {
        const props = Object.keys(pathBlock) as Array<keyof PathNode>;
        cssClasses.push(...props.map((prop) => {
          const value = pathBlock[prop];
          if (value === true) {
            return `block-${prop.toLowerCase()}`;
          } else if (value) {
            return `block-${prop.toLowerCase()}-${value.toLowerCase()}`;
          }
        }).filter((value) => !!value) as string[]);
      }
      return cssClasses;
    };

    return {
      pivot,
      assemblies,
      blockClasses,
      pivotColor,
    };
  }
});
</script>

<style lang="scss" scoped>
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
}

.data-block-rows {
  overflow: auto;
}



.data-block-column {
  position: relative;



  &.selected-block {
    .data-block-cell-top, .data-block-cell-bottom {
      border: 1px solid green !important;
    }

    .data-block-cell-top {
      border-bottom-color: transparent !important;
    }

    .data-block-cell-bottom {
      border-top-color: transparent !important;
    }

    //box-shadow: inset 0 0 5px black !important;
  }

  &:hover {
    .data-block-cell-top, .data-block-cell-bottom {
      border: 1px solid red !important;
    }

    .data-block-cell-top {
      border-bottom-color: transparent !important;
    }

    .data-block-cell-bottom {
      border-top-color: transparent !important;
    }

    //box-shadow: inset 0 0 5px black !important;
  }

  //width: calc(1.5rem + 2px);
  //height: calc(3rem + 4px);
  width: 1.5rem;
  height: 3rem;
  background: #eee;

  .data-block-cell-top, .data-block-cell-bottom {
    border: 1px solid #eee;
  }

  //border-right: 1px solid white;
  //border-left: 1px solid white;

  &.block-1 {
    background: white;

    .data-block-cell-top, .data-block-cell-bottom {
      border: 1px solid white;
    }
  }

  .pivot-data-block-cell {
    width: calc(1.5rem - 1px);
    height: 3rem; // calc(3rem + 1px);
  }

  .data-block-cell-top {
    //border: 1px solid white;
    width: calc(1.5rem - 2px);
    height: calc(1.5rem - 2px);

    &.block-type-present {
      background: black;
    }
  }

  .data-block-cell-bottom {
    //border: 1px solid white;

    position: relative;
    width: calc(1.5rem - 2px);
    height: calc(1.5rem - 2px);
    //overflow: hidden;

    &::before {
      position: absolute;
      content: '';
      display: block;
      width: calc(1.5rem - 4px);
      height: calc(1.5rem - 4px);
      //background: blue;
    }

    &::after {
      position: absolute;
      content: '';
      display: block;
      width: calc(1.5rem - 4px);
      height: calc(1.5rem - 4px);
      //background: red;
    }

    //case 0:
    //return 'duplication';
    //case 1:
    //return 'deletion';
    //case 2:
    //return 'insertion';
    //case 3:
    //return 'switch';
    //case 4:
    //return 'inversion';
    //case 5:
    //return 'inversion chain';
    //case 6:
    //return 'translocation';

    &.block-type-deletion::before {
      //background: green;
      border-top: 2px solid black;
    }

    &.block-type-insertion::before {
      //background: blue;
      border-right: 2px solid black;
    }

    &.block-type-switch::before {
      border-top: 2px solid black;
    }

    &.block-type-switch::after {
      border-right: 2px solid black;
    }

    &.block-type-inversion::before {
      //background: lightcoral;
      background: linear-gradient(45deg, red 0%, red 50%, transparent 50%, transparent 100%);
      transform: translateY(-50%) scale(0.66) rotate(-45deg);
    }

    &.block-type-inversion_chain::before {
      background: linear-gradient(45deg, red 0%, red 50%, transparent 50%, transparent 100%);
      transform: translateY(-50%) scale(0.66) rotate(-45deg);
    }

    &.block-type-inversion_chain::after {
      transform: translateX(50%);
      border-top: 2px solid red;
      z-index: 1;
    }

    &.block-type-translocation::before {
      background: lightblue;
      border-radius: 0 0 1.5rem 1.5rem;
      //transform: translateY(-25%);
    }

    &.block-type-translocation::after {
      border-top: 2px solid black;
    }
  }
}

.data-block-row {
  overflow: visible;

  .data-block-column {
    border: 1px solid #eee;
    overflow: visible;

    .data-block-cell {
      display: block;
      width: 100%;
      height: 50%;
      position: absolute;
      overflow: visible;

      &.block-present {
        background: black;
        bottom: 0;
      }

      &.block-cooccurence {
        bottom: 50%;
        background: #0086CA;
        height: 40%;
        border-radius: 1rem 1rem 0 0;
      }

      &.block-insertion {
        bottom: 50%;
        right: -0.25rem;
        width: 0;
        height: 0;
        border-left: 0.2rem solid transparent;
        border-right: 0.2rem solid transparent;
        border-bottom: 1rem solid #81CD06;
        z-index: 1;
      }

      &.block-swap-start {
        //background: red;
        //background: green;
        left: 0;
        bottom: 0.2rem;
        width: 0;
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
        bottom: 0.2rem;
        width: 0;
        height: 0;
        border-top: 0.5rem solid transparent;
        border-bottom: 0.5rem solid transparent;

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


      &.block-inversionchain, &.block-inversionchain-start, &.block-inversionchain-end {
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


      &.block-inversionchain::before {
        left: -1px;
        right: -1px;
        //width: calc(100% + 2px);
        border-bottom: 0.2rem solid #9D0D0D;
      }

      &.block-inversionchain-start::before {
        left: 50%;
        right: -1px;
        border-bottom: 0.2rem solid #9D0D0D;
      }

      &.block-inversionchain-end::before {
        left: -1px;
        right: 50%;
        border-bottom: 0.2rem solid #9D0D0D;
      }

      &.block-inversionchain::after, &.block-inversionchain-start::after, &.block-inversionchain-end::after {
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
</style>