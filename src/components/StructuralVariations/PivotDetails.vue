<template>
  <div class="structural-variations-details">

    <div class="table-container">
      <v-card tile>
        <div v-if="selectedBlock.pivot && selectedBlock.assembly && selectedBlock.block" class="data-area d-flex flex-row">

          <!-- "Header" column -->
          <div class="data-labels col-2 d-flex flex-column pr-0 mr-n1">

            <div class="data-label elevation-1 px-3">
              {{ assemblyName }}
            </div>

            <div class="data-label elevation-1 px-3">
              {{ pivotName }}
            </div>

          </div>

          <!-- "Data" column rows -->
          <div class="data-block-rows col-10 d-flex flex-column pl-0 mr-1">

            <div class="data-block-row d-flex flex-row">
              <div v-for="(assemblyStep, psIndex) in assemblySteps"
                   :key="`assembly-row-${assemblyName}-step-${assemblyStep.panBlock}`"
                   :class="['data-block-column', `block-${psIndex % 2}`, `elevation-1`]"
              >
                <div v-for="blockClass in assemblyStep.classes"
                     :key="`assembly-row-${assemblyName}-step-${assemblyStep.panBlock}-block-${blockClass}`"
                     :class="[ blockClass, 'data-block-cell']"></div>
              </div>
            </div>

            <div class="data-block-row d-flex flex-row">
              <div v-for="(pivotStep, psIndex) in pivotSteps"
                   :key="`pivot-row-${pivotName}-step-${pivotStep.panBlock}`"
                   :class="['data-block-column', `block-${psIndex % 2}`, `elevation-1`]"
              >
                <div v-for="blockClass in pivotStep.classes"
                     :key="`pivot-row-${pivotName}-step-${pivotStep.panBlock}-block-${blockClass}`"
                     :class="[ blockClass, 'data-block-cell']"></div>
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
import { PangenomeJson, PanNodes, Path, Paths } from "@/interfaces/pangenome-json";
import { PathNode, Pivot, PivotJson, PivotNode } from "@/interfaces/pivot-json";
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

        const pathNames = Object.keys(pangenome.value.paths) as Array<keyof Paths>;

        paths.value = pathNames.reduce((result, pathName) => ({
          ...result,
          [pathName]: data.pangenome.paths[pathName]
        }), {});
      }
    });

    const pivotSteps = computed(() => {
      if (pangenome.value && selectedBlock.value.pivot) {
        const pivotPath = pangenome.value.paths[selectedBlock.value.pivot];
        // const pivotBlock = pangenome.value.panSkeleton[selectedBlock.value.block];
        const pivot = pivots.value[selectedBlock.value.pivot];
        if (pivot) {
          debugger;
          const steps = pivotPath.steps.map((step) => ({...pangenome.value?.panSkeleton[step.panBlock], ...step, ...pivot[step.panBlock][selectedBlock.value.pivot]}));
          debugger;
          return steps;
        }
      }
      return [];
    });

    const assemblySteps = computed(() => {
      if (pangenome.value && pivots.value) {
        const assemblyPath = pangenome.value.paths[selectedBlock.value.assembly];
        // const assemblyBlock = pangenome.value.panSkeleton[selectedBlock.value.block];
        const assembly = pivots.value[selectedBlock.value.assembly];
        if (assembly) {
          debugger;
          const steps = assemblyPath.steps.map((step) => ({...pangenome.value?.panSkeleton[step.panBlock], ...step, ...assembly[step.panBlock][selectedBlock.value.pivot]}));
          debugger;
          return steps;
        }
      }
      return [];
    });

    const pivotName = computed(() => selectedBlock.value.pivot);
    const assemblyName = computed(() => selectedBlock.value.assembly);

    return {
      selectedBlock,
      pivotSteps,
      assemblySteps,
      pivotName,
      assemblyName,
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

.structural-variations-details {
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

  width: 1.5rem;
  height: 3rem;
  background: #eee;
  border: 1px solid transparent;


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
    border-color: red;
  }

  &.selected {
    border-color: green;
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
      .block-cooccurence {
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

      &.block-cooccurence {
        bottom: 50%;
        background: #0086CA;
        border-radius: 1rem 1rem 0 0;
      }

      &.block-insertion {
        bottom: 50%;
        right: -0.3rem;
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