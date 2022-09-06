import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () =>
      // import(/* webpackChunkName: "home" */ "../views/HomeView.vue")
      import(/* webpackChunkName: "PangenomeSelection" */ "../views/PangenomeSelection.vue")
  },
  {
    path: "/pangenome_selection",
    name: "Pangenome Selection",
    component: () =>
      import(/* webpackChunkName: "PangenomeSelection" */ "../views/PangenomeSelection.vue")
  },
  {
    path: "/structural_variations",
    name: "Structural Variations",
    component: () =>
      import(
        /* webpackChunkName: "StructuralVariations" */ "../views/StructuralVariations.vue"
        )
  },
  {
    path: "/presence_absence",
    name: "Presence Absence",
    component: () =>
      // import(/* webpackChunkName: "panache" */ "../views/PanacheView.vue")
      import(/* webpackChunkName: "HomeView" */ "../views/HomeView.vue")
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "AboutView" */ "../views/AboutView.vue")
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
