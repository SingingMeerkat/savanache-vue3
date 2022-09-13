<template>
  <div v-show="isLoading" class="text-center">
    <b-spinner label="Loading..." variant="info" />
  </div>
</template>

<script>
//import * as d3 from "d3";

export default {
  name: "LoadingSpinner",
  props: {
    isLoading: {
      type: Boolean,
      default: false
    }

  },
  data() {
    return {};
  },
  methods: {},
  watch: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

b-spinner {
  border: 0.4em solid;
}

</style>
