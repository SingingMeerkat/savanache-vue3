<template>
  <div class="structural-variations-filters">
    <v-row>
      <v-col cols="6">
        <v-select
          v-model="selectedPivotName"
          :items="assemblies"
          dense
          hide-details
          label="Selected Pivot"
        ></v-select>
      </v-col>
      <v-col cols="2">
        <v-select
          v-model="chromName"
          :items="chromItems"
          dense
          hide-details
          label="Select chrom"
        ></v-select>
      </v-col>
      <v-col class="d-flex" cols="4">

        <v-range-slider
          v-model="positionFilter"
          :disabled="!positionLimit[1]"
          :max="positionLimit[1]"
          :min="positionLimit[0]"
          :step="positionStep"
          class="v-col-12"
          hide-details
          label="Position"
          placeholder="Position"
          thumb-label
        >
          <template v-slot:prepend>
            <v-text-field
              v-model="positionFilter[0]"
              :disabled="!positionLimit[1]"
              density="compact"
              hide-details
              label="Min Position"
              placeholder="Min Position"
              type="number"
              variant="outlined"
            ></v-text-field>
          </template>
          <template v-slot:append>
            <v-text-field
              v-model="positionFilter[1]"
              :disabled="!positionLimit[1]"
              density="compact"
              hide-details
              label="Max Position"
              placeholder="Max Position"
              type="number"
              variant="outlined"
            ></v-text-field>
          </template>
        </v-range-slider>

      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">

      </v-col>
      <v-col cols="2">
        <v-select
          v-model="selectedSVTypeNames"
          :items="svItems"
          dense
          hide-details
          label="Select SVs"
          multiple
        ></v-select>
      </v-col>
      <v-col class="d-flex" cols="4">

        <v-range-slider
          v-model="lengthFilter"
          :disabled="!lengthLimit[1]"
          :max="lengthLimit[1]"
          :min="lengthLimit[0]"
          :step="lengthStep"
          class="v-col-12"
          hide-details
          label="Length"
          placeholder="Length"
          thumb-label
        >
          <template v-slot:prepend>
            <v-text-field
              v-model="lengthFilter[0]"
              :disabled="!lengthLimit[1]"
              density="compact"
              hide-details
              label="Min Length"
              placeholder="Min Length"
              type="number"
              variant="outlined"
            ></v-text-field>
          </template>
          <template v-slot:append>
            <v-text-field
              v-model="lengthFilter[1]"
              :disabled="!lengthLimit[1]"
              density="compact"
              hide-details
              label="Max Length"
              placeholder="Max Length"
              type="number"
              variant="outlined"
            ></v-text-field>
          </template>
        </v-range-slider>

      </v-col>
    </v-row>
  </div>
</template>

<script>

import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import { getData } from "@/data/data-source";
import { reactiveVuex } from "@/store/helper";

export default defineComponent({
  name: "StructuralVariationsFilters",
  components: {},
  setup() {
    const store = useStore();
    const selectedPivotName = reactiveVuex(store, "selectedPivotName", "setSelectedPivotName");
    const selectedSVTypeNames = reactiveVuex(store, "selectedSVTypeNames", "setSelectedSVTypeNames");
    const chromName = reactiveVuex(store, "chromOnDisplay", "setChromOnDisplay");

    const pivotItems = ref([]);

    const lengthStep = 10;

    const positionStep = 10;

    const lengthFilter = reactiveVuex(store, "lengthFilter", "setLengthFilter"); // ref((Math.round(limitLength * 0.01) / lengthStep) * lengthStep);
    const lengthLimit = reactiveVuex(store, "lengthLimit", "setLengthLimit"); // ref((Math.round(limitLength * 0.01) / lengthStep) * lengthStep);

    const positionFilter = reactiveVuex(store, "positionFilter", "setPositionFilter"); // ref((Math.round(limitPosition * 0.01) / positionStep) * positionStep);
    const positionLimit = reactiveVuex(store, "positionLimit", "setPositionLimit"); // ref((Math.round(limitPosition * 0.99) / positionStep) * positionStep);

    let data;

    getData(chromName.value).then((d) => {
      data = d;
      if (data) {
        pivotItems.value = Object.keys(data.pangenome.paths);
      }
    });

    const chromItems = computed(() => {
      console.log("Computing chromItems", { pivot: selectedPivotName.value, data: data });
      if (selectedPivotName.value && data) {
        return data.chromNamesPerPath[selectedPivotName.value];
        //} else { return ['Gm01'] }
      } else {
        return [];
      }
    });
    //const chromItems = ['Gm01'];

    watch(selectedPivotName, () => {
      if (!chromItems.value.includes(chromName.value)) {
        console.log("Modyfing chrom list with following chromItems", chromItems.value);
        chromName.value = chromItems.value[0];
      }
    });

    //watch(selectedPivotName, () => {
    watch(chromName, () => {

      getData(chromName.value).then((d) => {
        data = d;
        if (data) {
          pivotItems.value = Object.keys(data.pangenome.paths);
        }
      });

      let start;
      let end;
      const minLength = 0;
      let maxLength;
      if (data) {
        //const steps = data.pangenome.paths[selectedPivotName.value][data.chromName];
        const steps = data.pangenome.paths[selectedPivotName.value][chromName.value];
        if (steps && steps.length) {
          steps.forEach((step) => {
            const panBlock = data.pangenome.panSkeleton[step.panBlock];
            start = start === undefined ? step.startPosition : Math.min(step.startPosition, start);
            end = end === undefined ? step.startPosition : Math.max(step.startPosition + panBlock.length);
            // minLength = minLength === undefined ? panBlock.length : Math.min(panBlock.length, minLength);
            maxLength = maxLength === undefined ? panBlock.length : Math.max(panBlock.length, maxLength);
          });
        }
      }
      lengthLimit.value = [minLength, maxLength];
      lengthFilter.value = [minLength, maxLength];

      positionFilter.value = [start, end];
      positionLimit.value = [start, end];

      return { start, end, minLength, maxLength };
    });

    const svItems = [
      "insertion",
      "swap",
      "cooc",
      "inversion",
      "inversionChain"
    ];

    const selected = ref([]);
    const pangenomesSelectedStored = computed(() => {
      return store.getters["pangenomes/pangenomesSelected"];
    });


    // assemblies stored and filtered on Heterotic group
    const assemblies = computed(() => {
      let storeAssemblies = store.state.assemblies.assemblies;

      if (selected.value && selected.value.length) {
        storeAssemblies = storeAssemblies.filter(assembly => {
          return assembly.heterotic_group.filter(hg => {
            return selected.value.includes(hg);
          }).length !== 0;
        });
      }

      if (pangenomesSelectedStored.value && pangenomesSelectedStored.value.length) {
        storeAssemblies = storeAssemblies.filter(assembly => {
          return assembly.pangenome.filter(pangenome => {
            return pangenomesSelectedStored.value.filter(p => {
              return p.name === pangenome && p.selected;
            }).length !== 0;
          }).length !== 0;
        });
      }

      return storeAssemblies.map(assembly => assembly.assembly_name);
    });

    return {
      assemblies,
      chromItems,
      chromName,
      // pivotItems,
      selectedPivotName,
      svItems,
      selectedSVTypeNames,

      lengthLimit,
      lengthFilter,

      positionLimit,
      positionFilter,

      lengthStep,

      positionStep

    };
  }
});
</script>

<style lang="scss" scoped>

::v-deep .v-field__input input {
  width: 60px;
}

</style>