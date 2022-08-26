<template>
  <div>
    <h2>Pca Panache</h2>
    <JSCharting ref="chart" :options="options" class="mb-5"></JSCharting>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import JSCharting from "jscharting-vue";
import { useStore } from "vuex";

export default {
  components: {
    JSCharting
  },
  setup() {
    const store = useStore();
    const chart = ref(null);

    // Chart Initiation
    const options = ref({
      type: "marker",
      height: 500,
      legend: { template: "", visible: false },
      series: []
    });
    onMounted(() => {
      store.dispatch("chart/updateChartAction", chart.value);
    });
    return { options, chart };
  }
};
</script>

<style lang="scss" scoped></style>
