<template>
  <v-container class="structural-variations" fluid>
    <v-row class="top-row" v-show="!hideTopRow">
      <v-col cols="12">
        <v-card>
          <StructuralVariationsFilters></StructuralVariationsFilters>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="middle-row">
      <v-col cols="12">
        <a class="up-arrow" @click="toggleTopRow" v-show="!hideTopRow"></a>
        <a class="down-arrow" @click="toggleBottomRow" v-show="!hideBottomRow"></a>
        <a class="up-arrow-inverted" @click="toggleTopRow" v-show="hideTopRow"></a>
        <a class="down-arrow-inverted" @click="toggleBottomRow" v-show="hideBottomRow"></a>
        <v-card>
          <StructuralVariationsPivotComparisonTable></StructuralVariationsPivotComparisonTable>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="bottom-row" v-show="!hideBottomRow">
      <v-col :cols="assembliesTableCols" v-show="assembliesTableCols > 0">
        <a class="right-arrow" @click="moveColsRight" v-show="pivotDetailsCols > 0"></a>
        <a class="right-arrow-inverted" @click="moveColsLeft" v-show="pivotDetailsCols === 0"></a>
        <v-card>
          <StructuralVariationsAssembliesTable></StructuralVariationsAssembliesTable>
        </v-card>
      </v-col>
      <v-col :cols="pivotDetailsCols" v-show="pivotDetailsCols > 0">
        <a class="left-arrow" @click="moveColsLeft" v-show="assembliesTableCols > 0"></a>
        <a class="left-arrow-inverted" @click="moveColsRight" v-show="assembliesTableCols === 0"></a>
        <v-card>
          <StructuralVariationsPivotDetails></StructuralVariationsPivotDetails>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { computed, defineComponent, ref } from "vue";
import StructuralVariationsAssembliesTable from "../components/StructuralVariations/AssembliesTable.vue";
import StructuralVariationsFilters from "../components/StructuralVariations/Filters.vue";
import StructuralVariationsPivotComparisonTable from "../components/StructuralVariations/PivotComparisonTable.vue";
import StructuralVariationsPivotDetails from "../components/StructuralVariations/PivotDetails.vue";

export default defineComponent({
  name: "StructuralVariations",
  components: {
    StructuralVariationsFilters,
    StructuralVariationsPivotComparisonTable,
    StructuralVariationsAssembliesTable,
    StructuralVariationsPivotDetails
  },
  setup() {
    const colSplit = ref(6);
    const assembliesTableCols = computed(() => (colSplit.value));
    const pivotDetailsCols = computed(() => (12 - colSplit.value));

    const hideTopRow = ref(false);
    const hideBottomRow = ref(false);

    const moveColsLeft = () => (colSplit.value > 0) ? colSplit.value -= 6 : undefined;
    const moveColsRight = () => (colSplit.value < 12) ? colSplit.value += 6 : undefined;

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
      toggleBottomRow,
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
    bottom: 0;
    transform: translateY(-50%);
  }
}

.right-arrow {
  &, &-inverted {
    top: 0;
    transform: translateY(50%);
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
