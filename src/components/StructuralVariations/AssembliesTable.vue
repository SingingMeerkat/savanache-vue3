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
            :model-value="selectedAssemblyKeyNames[row.name]"
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
    const selectedAssemblyNames = reactiveVuex(store, "selectedAssemblyNames", "setSelectedAssemblyNames");

    const paths = ref([]);

    getData().then((data) => {
      if (data) {
        const pathNames = Object.keys(data.pangenome.paths);
        paths.value = pathNames.map((pathName) => ({
          name: pathName,
          chromName: data.chromName,
          steps: data.pangenome.paths[pathName] && data.pangenome.paths[pathName][data.chromName]?.length || 0
        }));
        allSelected.value = false;
      }
    });


    // const selectedAssemblyNames = reactiveVuexObject(store.state.selectedAssemblyNames, store.commit, "setSelectedAssemblyNames");

    const selectedAssemblyKeyNames = computed(() => {
      return selectedAssemblyNames.value.reduce((output, input) => ({...output, [input]: true}), {});
    });

    const allSelected = computed({
      get: () => paths.value.every((path) => selectedAssemblyKeyNames.value[path.name]),
      set: (value) => paths.value.forEach((path) => (selectedAssemblyKeyNames.value[path.name] = value))
    });

    const selectRow = (row) => {
      if (!selectedAssemblyNames.value.includes(row.name)) {
        selectedAssemblyNames.value.push(row.name);
      } else {
        selectedAssemblyNames.value = selectedAssemblyNames.value.filter(name => name !== row.name);
      }
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
      selectedAssemblyNames,
      selectedAssemblyKeyNames,
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
