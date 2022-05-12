<template>
  <div class="structural-variations-some-table v-col-6">
    <v-table>
      <thead>
        <tr>
          <th>
            <v-checkbox v-model="allSelected" hide-details inline></v-checkbox>
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
import { mapActions, mapState } from "vuex";

interface PathRow {
  name: string;
  steps: number;
}

export default defineComponent({
  name: "StructuralVariationsAssembliesTable",
  components: {},
  computed: mapState(["selectedAssemblies"]),
  methods: mapActions(["setSelectedAssemblies"]),
  setup() {
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

    const rows = ref([] as Array<PathRow>);
    const rowSelected = ref({} as { [k: string]: boolean });

    getData().then((data) => {
      if (data) {
        const pathNames = Object.keys(data.pangenome.paths) as Array<
          keyof Paths
        >;
        rows.value = pathNames.map((pathName) => ({
          name: pathName,
          steps: data.pangenome.paths[pathName].steps.length,
        }));
        rowSelected.value = rows.value.reduce(
          (result, path) => ({ ...result, [path.name]: false }),
          {} as { [k: string]: boolean }
        );
      }
    });

    const allSelected = computed({
      get: () => rows.value.every((path) => rowSelected.value[path.name]),
      set: (value: boolean) => rows.value.forEach((path) => (rowSelected.value[path.name] = value)),
    });

    const selectRow = (row: PathRow) => {
      rowSelected.value[row.name] = !rowSelected.value[row.name];
    };

    return {
      rows,
      columns,
      allSelected,
      rowSelected,
      selectRow,
    };
  },
});
</script>

<style lang="scss" scoped>
.data-table ::v-deep .v-data-table-header {
  th {
    background: #eee !important;
    white-space: nowrap;

    .v-input__control {
      background: white;
    }
  }
}

.phenotype-filter-input,
.heterotic-group-filter-input {
  display: inline-block;
}

.phenotype-filter-input {
  width: 6rem;
}

.heterotic-group-filter-input {
  width: 8rem;
}

.structural-variations-some-table {
  th:first-of-type,
  td:first-of-type {
    width: 0;
  }
}
</style>
