<template>
  <div class="structural-variations-some-table v-col-6">
    <v-table density="compact">
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
            :model-value="selectedRows[row.name]"
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { getData } from "@/data/data-source";
import { Paths } from "@/interfaces/pangenome-json";
import { useStore } from "vuex";
import { PathRow } from "@/interfaces/path-row";

export default defineComponent({
  name: "StructuralVariationsAssembliesTable",
  components: {},
  setup() {
    const store = useStore();

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

    const selectedAssemblies = computed<{ [k: string]: boolean }>(() => store.state.selectedAssemblies);
    const setSelectedAssemblies = (assemblies: { [k: string]: boolean }) => store.commit("setSelectedAssemblies", assemblies);

    const selectedRows = ref({ ...selectedAssemblies.value });

    const allSelected = computed({
      get: () => paths.value.every((path) => selectedRows.value[path.name]),
      set: (value: boolean) => {
        paths.value.forEach((path) => (selectedRows.value[path.name] = value));
        setSelectedAssemblies(selectedRows.value);
      }
    });

    const selectRow = (row: PathRow) => {
      selectedRows.value[row.name] = !selectedRows.value[row.name];
      setSelectedAssemblies({ ...selectedRows.value });
      // selectedAssemblies.value[row.name] = !selectedAssemblies.value[row.name];
    };

    watch(selectedAssemblies, (newVal) => {
      selectedRows.value = { ...newVal };
    }, { deep: true });

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
      selectedRows,
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
