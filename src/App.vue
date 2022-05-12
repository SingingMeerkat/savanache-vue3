<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title> Something </v-app-bar-title>
      <div class="margin-auto">
        <v-tabs v-model="selectedRoute" class="header-tabs">
          <v-tab> Pangenome Selection </v-tab>
          <v-tab> Structural Variations </v-tab>
          <v-tab> Presence Absence </v-tab>
        </v-tabs>
      </div>
    </v-app-bar>

    <v-main>
      <!--    Start Navigation Drawer-->
      <v-navigation-drawer v-model="drawer" :temporary="true">
        <v-list-item>
          <v-list-item-title class="text-h6">
            v-list-item-title
          </v-list-item-title>
          <v-list-item-subtitle> v-list-item-subtitle </v-list-item-subtitle>
        </v-list-item>

        <v-divider></v-divider>

        <v-list>
          <v-list-item :to="{ name: 'Home' }" exact link>
            <v-list-item-icon icon="mdi-home"> </v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <router-view :key="$route.fullPath"> </router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, ref, watch } from "vue";

export default defineComponent({
  name: "App",

  components: {},

  setup() {
    const vm = getCurrentInstance();

    const routes = [
      "/pangenome_selection",
      "/structural_variations",
      "/presence_absence",
    ];

    const drawer = ref(false);
    const selectedRoute = ref(0);
    // const selectedRoute = computed({
    //   get() { const index = routes.indexOf(vm.proxy.$route.path); return index >= 0 ? index : undefined; },
    //   set(val) { const route = routes[val]; if (route) vm.proxy.$router.push(routes[val]); }
    // });

    watch(
      () => vm && vm.proxy && vm.proxy.$route,
      (newVal) => {
        if (newVal) {
          const routeIndex = routes.indexOf(newVal.path);
          if (routeIndex > -1 && selectedRoute.value !== routeIndex) {
            selectedRoute.value = routeIndex;
          }
        }
      }
    );

    watch(selectedRoute, (newVal) => {
      const route = routes[newVal];
      if (route && vm && vm.proxy && vm.proxy.$route.path !== route) {
        vm.proxy.$router.push(route);
      }
    });

    return {
      drawer,
      selectedRoute,
    };
  },
});
</script>

<style lang="scss">
.margin-auto {
  margin: auto;
}

.header-tabs .v-tabs-bar {
  background-color: transparent !important;
}

//#app {
//  font-family: Avenir, Helvetica, Arial, sans-serif;
//  -webkit-font-smoothing: antialiased;
//  -moz-osx-font-smoothing: grayscale;
//  text-align: center;
//  color: #2c3e50;
//}
//
//#nav {
//  padding: 30px;
//
//  a {
//    font-weight: bold;
//    color: #2c3e50;
//
//    &.router-link-exact-active {
//      color: #42b983;
//    }
//  }
//}
</style>
