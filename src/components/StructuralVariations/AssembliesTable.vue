<template>
  <div class="structural-variations-some-table">
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
            :model-value="selectedAssemblyNameKeys[row.name]"
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

<script>
import { computed, defineComponent, ref } from "vue";
import { getData } from "@/data/data-source";
import { useStore } from "vuex";
import { reactiveVuex } from "@/store/helper";

export default defineComponent({
  name: "StructuralVariationsAssembliesTable",
  components: {},
  setup() {
    const store = useStore();
    const selectedAssemblyNameKeys = reactiveVuex(store, "selectedAssemblyNameKeys", "setselectedAssemblyNameKeys");

    const paths = ref([]);

    getData().then((data) => {
      if (data) {
        const pathNames = Object.keys(data.pangenome.paths);
        paths.value = pathNames.map((pathName) => ({
          name: pathName,
          steps: data.pangenome.paths[pathName] && data.pangenome.paths[pathName]?.steps.length || 0
        }));
        allSelected.value = false;
      }
    });


    // const selectedAssemblyNameKeys = reactiveVuexObject(store.state.selectedAssemblyNameKeys, store.commit, "setselectedAssemblyNameKeys");

    const allSelected = computed({
      get: () => paths.value.every((path) => selectedAssemblyNameKeys.value[path.name]),
      set: (value) => paths.value.forEach((path) => (selectedAssemblyNameKeys.value[path.name] = value))
    });

    const selectRow = (row) => {
      selectedAssemblyNameKeys.value[row.name] = !selectedAssemblyNameKeys.value[row.name];
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
      selectedAssemblyNameKeys,
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
