<template>
  <v-container class="structural-variations" fluid>
    <v-row v-show="!hideTopRow" class="top-row">
      <v-col cols="12">
        <v-card>
          <StructuralVariationsFilters></StructuralVariationsFilters>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="middle-row">
      <v-col cols="12">
        <a v-show="!hideTopRow" class="up-arrow" @click="toggleTopRow"></a>
        <a v-show="!hideBottomRow" class="down-arrow" @click="toggleBottomRow"></a>
        <a v-show="hideTopRow" class="up-arrow-inverted" @click="toggleTopRow"></a>
        <a v-show="hideBottomRow" class="down-arrow-inverted" @click="toggleBottomRow"></a>
        <v-card>
          <StructuralVariationsPivotComparisonTable></StructuralVariationsPivotComparisonTable>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-show="!hideBottomRow" class="bottom-row">
      <v-col v-show="assembliesTableCols > 0" :cols="assembliesTableCols">
        <a v-show="pivotDetailsCols > 0" class="right-arrow" @click="moveColsRight"></a>
        <a v-show="pivotDetailsCols === 0" class="right-arrow-inverted" @click="moveColsLeft"></a>
        <v-card class="overflow-auto">
          <AssembliesTable />
<!--          <StructuralVariationsAssembliesTable></StructuralVariationsAssembliesTable>-->
        </v-card>
      </v-col>
      <v-col v-show="pivotDetailsCols > 0" :cols="pivotDetailsCols">
        <a v-show="assembliesTableCols > 0" class="left-arrow" @click="moveColsLeft"></a>
        <a v-show="assembliesTableCols === 0" class="left-arrow-inverted" @click="moveColsRight"></a>
        <v-card>
          <StructuralVariationsPivotDetails></StructuralVariationsPivotDetails>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { computed, defineComponent, ref } from "vue";
// import StructuralVariationsAssembliesTable from "../components/StructuralVariations/AssembliesTable.vue";
import StructuralVariationsFilters from "../components/StructuralVariations/Filters.vue";
import StructuralVariationsPivotComparisonTable from "../components/StructuralVariations/PivotComparisonTable.vue";
import StructuralVariationsPivotDetails from "../components/StructuralVariations/PivotDetails.vue";
import AssembliesTable from "@/components/AssembliesTable";

export default defineComponent({
  name: "StructuralVariations",
  components: {
    StructuralVariationsFilters,
    StructuralVariationsPivotComparisonTable,
    AssembliesTable,
    // StructuralVariationsAssembliesTable,
    StructuralVariationsPivotDetails
  },
  setup() {
    const colSplit = ref(8);
    const assembliesTableCols = computed(() => (colSplit.value));
    const pivotDetailsCols = computed(() => (12 - colSplit.value));

    const hideTopRow = ref(false);
    const hideBottomRow = ref(false);

    const moveColsLeft = () => (colSplit.value > 0) ? colSplit.value -= 4 : undefined;
    const moveColsRight = () => (colSplit.value < 12) ? colSplit.value += 4 : undefined;

    const toggleTopRow = () => hideTopRow.value = !hideTopRow.value;
    const toggleBottomRow = () => hideBottomRow.value = !hideBottomRow.value;

    return {
      assembliesTableCols,
      pivotDetailsCols,
      moveColsLeft,
      moveColsRight,

      hideTopRow,
      hideBottomRow,

      toggleTopRow,
      toggleBottomRow
    };
  }
});
</script>

<style lang="scss" scoped>
.structural-variations {
  display: flex;
  flex-direction: column;
  height: 100%;

  > .v-row {
    margin: 0.25rem;
    position: relative;
    overflow: visible;
    flex-grow: 1;
    flex-shrink: 1;

    > .v-col {
      position: relative;
      overflow: visible;
      height: 100%;

      > .v-card {
        padding: 1rem;
        position: relative;
        overflow: visible;
        height: 100%;
      }
    }
  }
}

.top-row {
  height: auto;
}

.middle-row {
  height: 100%;
}

.bottom-row {
  height: auto;
}

.arrows {
  //width: 100%;
  //height: 100%;
  //position: absolute;
  //z-index: 1;
}

.left-arrow, .right-arrow, .up-arrow, .down-arrow {
  &, &-inverted {
    display: block;
    position: absolute;
    z-index: 3;
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;

    &::after {
      content: "";
      display: block;
      position: absolute;
      width: 0;
      height: 0;
      border: 0.5rem solid transparent;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
}

.left-arrow {
  &, &-inverted {
    top: 0;
    transform: translate(50%, 50%);
  }
}

.right-arrow {
  &, &-inverted {
    top: 0;
    transform: translate(-50%, 50%);
  }
}

.left-arrow {
  &, &-inverted {
    left: -0.5rem;
  }

  &::after {
    border-right: 0.75rem solid #aaa !important;
    border-left: 0 solid transparent !important;
  }

  &-inverted::after {
    border-left: 0.75rem solid #aaa !important;
    border-right: 0 solid transparent !important;
  }
}

.right-arrow {
  &, &-inverted {
    right: -0.5rem;
  }

  &::after {
    border-left: 0.75rem solid #aaa !important;
    border-right: 0 solid transparent !important;
  }

  &-inverted::after {
    border-right: 0.75rem solid #aaa !important;
    border-left: 0 solid transparent !important;
  }
}


.up-arrow, .down-arrow {
  &, &-inverted {
    left: 50%;
    transform: translateX(-50%);
  }
}

.up-arrow {
  &, &-inverted {
    top: -0.5rem;
  }

  &::after {
    border-bottom: 0.75rem solid #aaa !important;
    border-top: 0 solid transparent !important;
  }

  &-inverted::after {
    border-top: 0.75rem solid #aaa !important;
    border-bottom: 0 solid transparent !important;
  }
}

.down-arrow {
  &, &-inverted {
    bottom: -0.5rem;
  }

  &::after {
    border-top: 0.75rem solid #aaa !important;
    border-bottom: 0 solid transparent !important;
  }

  &-inverted::after {
    border-bottom: 0.75rem solid #aaa !important;
    border-top: 0 solid transparent !important;
  }
}


::v-deep(.structural-variations-some-table) {
  //height: 100%;
}
</style>
