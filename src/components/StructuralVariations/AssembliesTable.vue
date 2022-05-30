<template>
  <v-table class="structural-variations-some-table" density="compact">
    <thead>
    <tr>
      <th>
        <v-checkbox v-model="allSelected" density="compact" hide-details inline></v-checkbox>
      </th>
      <th v-for="column in columns" :key="`header-column-${column.value}`">
        {{ column.text }}
      </th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="row in rows" :key="`row-${row.name}`" @click.stop="selectRow(row)">
      <td>
        <v-checkbox
          :model-value="selectedAssemblies[row.name]"
          density="compact"
          hide-details
          inline
          @click.stop="selectRow(row)"
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
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { getData } from "@/data/data-source";
import { Paths } from "@/interfaces/pangenome-json";
import { useStore } from "vuex";
import { PathRow } from "@/interfaces/path-row";
import { reactiveVuex } from "@/store/helper";

export default defineComponent({
  name: "StructuralVariationsAssembliesTable",
  components: {},
  setup() {
    const store = useStore();
    const selectedAssemblies = reactiveVuex<typeof store.state.selectedAssemblies>(store, "selectedAssemblies", "setSelectedAssemblies");

    const paths = ref([] as Array<PathRow>);

    getData().then((data) => {
      if (data) {
        const pathNames = Object.keys(data.pangenome.paths) as Array<keyof Paths>;
        paths.value = pathNames.map((pathName) => ({
          name: pathName,
          steps: data.pangenome.paths[pathName].steps.length
        }));
        allSelected.value = false;
      }
    });


    // const selectedAssemblies = reactiveVuexObject(store.state.selectedAssemblies, store.commit, "setSelectedAssemblies");

    const allSelected = computed({
      get: () => paths.value.every((path) => selectedAssemblies.value[path.name]),
      set: (value: boolean) => paths.value.forEach((path) => (selectedAssemblies.value[path.name] = value))
    });

    const selectRow = (row: PathRow) => {
      selectedAssemblies.value[row.name] = !selectedAssemblies.value[row.name];
    };

    const columns = [
      {
        text: "Name",
        value: "name",
        sortable: true
      },
      {
        text: "Steps",
        value: "steps",
        sortable: true
      }
    ];

    return {
      rows: paths,
      columns,
      allSelected,
      selectedAssemblies,
      selectRow
    };
  }
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
