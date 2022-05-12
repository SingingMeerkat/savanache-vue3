<template>
  <div class="structural-variations-some-table v-col-6">
    <v-table density="compact">
      <thead>
        <tr>
          <th>
            <v-checkbox v-model="allSelected" hide-details inline density="compact"></v-checkbox>
          </th>
          <th v-for="column in columns" :key="`header-column-${column.value}`">
            {{ column.text }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="`row-${row.name}`" @click="selectRow(row)">
          <td>
            <v-checkbox
              v-model="rowSelected[row.name]"
              hide-details
              inline
              density="compact"
            ></v-checkbox>
          </td>
          <td
            v-for="column in columns"
            :key="`row-${row.name}-column-${column.value}`"
          >
            {{ row[column.value] }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  Ref,
  ref,
  unref,
  UnwrapRef,
  watch,
} from "vue";
import { getData } from "@/data/data-source";
import { Paths } from "@/interfaces/pangenome-json";
import { mapActions, mapState, useStore } from "vuex";

interface PathRow {
  name: string;
  steps: number;
}

export default defineComponent({
  name: "StructuralVariationsAssembliesTable",
  components: {},
  setup() {
    const store = useStore();

    const selectedAssemblies = computed(() => store.state.selectedAssemblies);

    const columns = [
      {
        text: "Name",
        value: "name",
        sortable: true,
      },
      {
        text: "Steps",
        value: "steps",
        sortable: true,
      },
    ];

    const paths = ref([] as Array<PathRow>);

    getData().then((data) => {
      if (data) {
        const pathNames = Object.keys(data.pangenome.paths) as Array<
          keyof Paths
        >;
        paths.value = pathNames.map((pathName) => ({
          name: pathName,
          steps: data.pangenome.paths[pathName].steps.length,
        }));
      }
    });

    const allSelected = computed({
      get: () => paths.value.every((path) => selectedAssemblies.value[path.name]),
      set: (value: boolean) => paths.value.forEach((path) => (selectedAssemblies.value[path.name] = value)),
    });

    const selectRow = (row: PathRow) => {
      selectedAssemblies.value[row.name] = !selectedAssemblies.value[row.name];
    };

    return {
      rows: paths,
      columns,
      allSelected,
      rowSelected: selectedAssemblies,
      selectRow,
    };
  },
});
</script>

<style lang="scss" scoped>

.structural-variations-some-table {
  th:first-of-type,
  td:first-of-type {
    width: 0;
  }
  th, td {
    vertical-align: middle;
  }
  input[type="checkbox"] {

  }
}
</style>
