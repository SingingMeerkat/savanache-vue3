<template>
  <div class="structural-variations-some-table v-col-6">
    <v-table>
      <thead>
        <tr>
          <th>
            <v-checkbox @model="selectAll" hide-details inline></v-checkbox>
          </th>
          <th
            v-for="header in someHeaders"
            :key="`header-cell-${header.value}`"
          >
            {{ header.text }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in someItems"
          :key="`row-${item.id}`"
          @click="selectItem(item)"
        >
          <td>
            <v-checkbox
              @change="selectItem(item)"
              hide-details
              inline
            ></v-checkbox>
          </td>
          <td
            v-for="header in someHeaders"
            :key="`row-${item.id}-cell-${header.value}`"
          >
            {{ item[header.value] }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, UnwrapRef } from "vue";
import { getData } from "@/data/data-source";
import { Paths } from "@/interfaces/pangenome-json";
import { mapActions, mapState } from "vuex";

export default defineComponent({
  name: "StructuralVariationsAssembliesTable",
  components: {},
  computed: mapState(["selectedAssemblies"]),
  methods: mapActions(["setSelectedAssemblies"]),
  setup() {
    const someHeaders = ref([
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
    ]);

    const someItems: Ref<
      UnwrapRef<Array<{ id: string; name: string; steps: number }>>
    > = ref([]);

    const selected: Ref<
      UnwrapRef<Array<{ id: string; name: string; steps: number }>>
    > = ref([]);

    const selectAll = computed({
      get: () => someItems.value.every((i) => selected.value.includes(i)),
      set: (value) => {
        if (value) {
          selected.value = [...someItems.value];
        } else {
          selected.value = [];
        }
      },
    });

    const phenotypeFilter = ref("");

    const heteroticGroupFilter = ref("");

    getData().then((data) => {
      if (data) {
        const paths = Object.keys(data.pangenome.paths) as Array<keyof Paths>;

        someItems.value = paths.map((key) => ({
          id: key,
          name: key,
          steps: data.pangenome.paths[key].steps.length,
        }));
      }
    });

    const selectItem = (item: { id: string; name: string; steps: number }) => {
      if (selected.value.indexOf(item) >= 0) {
        selected.value = selected.value.filter((s) => s !== item);
      } else {
        selected.value.push(item);
      }
    };
    return {
      someHeaders,
      someItems,
      selected,
      selectAll,
      // selected: store.selectedAssemblies,
      phenotypeFilter,
      heteroticGroupFilter,
      selectItem,
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
