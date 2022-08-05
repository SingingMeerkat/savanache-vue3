<template>
  <!-- Pangenome selector Contenor -->
  <div class="Home">
    <h1>Pangenome Selector</h1>
    <!-- Assemblies Input File -->
    <v-file-input v-model="assembliesFile" accept=".csv, .tsv" class="mb-5" counter
                  label="Choose a file or drop it here..." show-size @change="onFileChange"></v-file-input>
    <v-row>
      <!-- Chart and Assemblies Table -->
      <v-col>
        <PcaCharts />
        <AssembliesTable />
      </v-col>
      <!-- Pangenome Table -->
      <v-col lg="3" md="4">
        <PangenomePanel />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { computed, ref } from "vue";
import { useStore } from "vuex";

// Components
import PangenomePanel from "../components/PangenomePanel.vue";
import AssembliesTable from "../components/AssembliesTable.vue";
import PcaCharts from "../components/PcaCharts.vue";
// import pangenomes from "@/data/pangenome";

export default defineComponent({
  name: "PangenomeSelection",

  components: { AssembliesTable, PangenomePanel, PcaCharts },
  setup() {
    const store = useStore();
    // Pangenomes default initiation
    // store.dispatch("pangenomes/updatePangenomesAction", pangenomes);

    // File value
    const assembliesFile = ref([]);
    const fileinput = ref("");

    // Assemblies File upload
    const onFileChange = e => {
      // Get file by events
      const files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      createInput(files[0]);
    };

    const createInput = file => {
      // Input reading
      const promise = new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve((fileinput.value = reader.result));
        };
        reader.readAsText(file);
      });

      promise.then(
        () => {
          // Input Parsing
          const lines = fileinput.value.split("\n");
          // Defaults, can be re-arranged if the headers are in the wrong order in the incoming file
          const headers = {
            id:0,
            x:1,
            y:2,
            assembly_name:3,
            phenotype:4,
            pangenome:5,
            Heterotic_group:6,
            majore:7
          };
          const assemblies = lines.map((line, lineIndex) => {
            const cols = line.split("\t");
            if (lineIndex === 0 && line.length !== 0) {
              cols.forEach((col, colIndex) => headers[name] = colIndex);
            } else if (line.length !== 0) {
              const assembly = {
                id: parseInt(cols[headers.id]),
                x: parseInt(cols[headers.x]),
                y: parseInt(cols[headers.y]),
                assembly_name: cols[headers.assembly_name],
                phenotype: cols[headers.phenotype],
                pangenome: cols[headers.pangenome].split(", "),
                heterotic_group: cols[headers.Heterotic_group].split(", "),
                majore: cols[headers.majore]
              };
              return assembly;
            }
            // Filter assemblies badly loaded
          }).filter(assembly => assembly !== undefined);
          const colors = [];
          const assembliesObjects = assemblies.map(assembly => {
            // Add metadata
            assembly["color"] = "black";
            assembly["metadata"] = "heterotic_group";
            assembly["selected"] = false;
            assembly["overMoused"] = false;
            if (assembly.majore !== undefined) {
              if (assembly.majore.toLowerCase().replace(/\s+/g, "") === "true") {
                assembly["majore"] = true;
              } else {
                assembly["majore"] = false;
              }
            } else {
              assembly["majore"] = false;
            }
            return assembly;
          });
          // Get all heterotic group
          const heterotic_group = [...new Set(assembliesObjects.map(assembly => String(...assembly.heterotic_group)))];

          // Get color by hetoric group
          new Set(heterotic_group.map(() => colors.push(generateColor())));
          assembliesObjects.map(assembly => {
            assembly["color"] = colors[heterotic_group.indexOf(assembly[assembly["metadata"]][0])];
          });

          // Add assemblies to store
          store.dispatch("assemblies/updateAssembliesAction", assembliesObjects);

          // Get assemblies stored
          const assembliesStored = computed(() => store.state.assemblies.assemblies);

          // add Assemblies to chart
          const series = addSeries(assembliesStored.value);
          series.forEach(serie => store.state.chart.chart.instance.series.add(serie));
        },
        error => {
          /* handle an error */
          console.error(error);
        }
      );
    };

    // Color Generator
    const generateColor = () => {
      const newColor = "#" + ((Math.random() * 0xffffff) << 0).toString(16);
      return newColor;
    };

    // Set series for chart
    const addSeries = newAssemblies => {
      // Serie is an object with a list of points
      const assembliesByMetadata = [];
      let metadatas = [];

      // Chart stored and initiated in PcaChart component
      const chart = store.state.chart.chart;

      if (newAssemblies !== undefined) {
        newAssemblies.forEach(assembly => {
          // Get all metadata value (default is Heterotic group value)
          metadatas.push(...assembly[assembly.metadata]);
        });
        // Get Unique value
        metadatas = [...new Set(metadatas)];

        // Ordered assemblies by metadata in Objects
        // [
        //     {
        //      metadataName: metadata_1,
        //      assemblies: [assembly_1, ...]
        //     }
        // ]
        metadatas.forEach(metadata => assembliesByMetadata.push({
          metadataName: metadata,
          assemblies: newAssemblies.filter(assembly => assembly[assembly.metadata].includes(metadata))
        }));

        const series = [];
        assembliesByMetadata.forEach(metadata => {
          // Each metadata (each serie)
          const pointsAdded = [];
          metadata.assemblies.forEach(assembly => {
            // Points setting

            let markerType = "circle";
            let pointLabel = "";
            let defaultColor = "black";
            if (assembly.selected) {
              defaultColor = "gray";
            }
            if (assembly.majore === true) {
              markerType = "square";
              pointLabel = assembly.assembly_name;
            }
            // Get point if the current assembly is already set in another serie
            const assemblyTreated = series.map(serie => {
              const currentSerie = serie.points.map(point => {
                if (point !== undefined) {
                  return point.name;
                }
              });
              if (currentSerie !== undefined) {
                return currentSerie;
              }
            });

            const PointObj = {
              // Point himself
              // Point arguments
              x: assembly.x,
              y: assembly.y,
              name: assembly.assembly_name,
              color: defaultColor,
              marker: { type: markerType },
              // Default color
              metadata: assembly.color,
              label: {
                text: pointLabel,
                align: "center",
                color: "black"
              },
              selected: assembly.selected,
              events: {
                // all events related to chart
                // "this" is particular, it don't refered to the website, but the "this" keyword refers to the clicked/hovered/... point object.
                // !!!! function have to be defined in this space not outside like a methods !!!!
                mouseOver: function() {
                  // changing hovered state in to store for the current assembly
                  store.dispatch("assemblies/updateOverMousedStateAction", assembly);

                  // Set color for the current point
                  this.series.currentOptions.color = assembly.color;

                  // Set color for all points with the same metadata
                  chart.instance
                    .series(s => assembly[assembly.metadata].includes(s.name))
                    .points()
                    .items.forEach(point => {
                    chart.instance
                      .series(s => assembly[assembly.metadata].includes(s.name))
                      .points(allPoint => allPoint.name === point.name)
                      .options({ color: point.currentOptions.metadata });
                  });
                },
                mouseOut: function() {
                  // Redo all colors

                  this.currentOptions.marker.outline.color = "gray";

                  // For all points with the same metadata
                  chart.instance
                    .series(s => assembly[assembly.metadata].includes(s.name))
                    .points()
                    .items.forEach(point => {
                    if (point.selected) {
                      // Gray if it's selected
                      chart.instance
                        .series(s => assembly[assembly.metadata].includes(s.name))
                        .points(allPoint => allPoint.name === point.name)
                        .options({ color: "gray" });
                    } else {
                      // Else Black
                      chart.instance
                        .series(s => assembly[assembly.metadata].includes(s.name))
                        .points(allPoint => allPoint.name === point.name)
                        .options({ color: "black" });
                    }
                  });

                  if (this.series.points(p => p.name === assembly.assembly_name)) {
                    // for the current point only
                    this.series
                      .points(p => p.name === assembly.assembly_name)
                      .items.forEach(point => {
                      store.dispatch("assemblies/updateNoMoreOverMousedStateAction", assembly);
                      if (point.selected) {
                        this.series.points(allPoint => allPoint.name === point.name).options({ color: "gray" });
                      } else {
                        this.series.points(allPoint => allPoint.name === point.name).options({ color: "black" });
                      }
                    });
                  }
                  // for all other points
                  this.series
                    .points(p => p.name !== assembly.assembly_name)
                    .items.forEach(point => {
                    if (point.selected) {
                      this.series.points(allPoint => allPoint.name === point.name).options({ color: "gray" });
                    } else {
                      this.series.points(allPoint => allPoint.name === point.name).options({ color: "black" });
                    }
                  });
                },
                click: function() {
                  // On clicked point
                  // For the current point
                  this.series
                    .points(p => p.name === assembly.assembly_name)
                    .items.forEach(point => {
                    if (point.selected) {
                      store.dispatch("assemblies/updateIsNotSelectedStateAction", assembly);
                      // If it was selected -> unselect this point
                      point.series.currentOptions.color = "black";
                      this.series.points(allPoint => allPoint.name === point.name).options({
                        color: "black",
                        selected: assembly.selected
                      });
                      this.userOptions.marker.outline.color = "white";
                    } else {
                      // If it was unselect -> select
                      store.dispatch("assemblies/updateIsSelectedStateAction", assembly);
                      point.series.currentOptions.color = "gray";
                      this.series.points(allPoint => allPoint.name === point.name).options({
                        color: "gray",
                        selected: assembly.selected
                      });
                      this.userOptions.marker.outline.color = "gray";
                    }
                  });
                  // For other points
                  this.series
                    .points(p => p.name !== assembly.assembly_name)
                    .items.forEach(point => {
                    // Keep colors
                    if (point.selected) {
                      this.series.currentOptions.color = "gray";
                      this.series.points(allPoint => allPoint.name === point.name).options({ color: "gray" });
                    } else {
                      this.series.currentOptions.color = "black";
                      this.series.points(allPoint => allPoint.name === point.name).options({ color: "black" });
                    }
                  });
                }
              }
            };

            // Keep the assembly only if it's not treated
            if (!assemblyTreated.flat().includes(assembly.assembly_name)) {
              pointsAdded.push(PointObj);
            }
          });
          // Add serie
          series.push({
            id: metadata.metadataName,
            name: metadata.metadataName,
            type: "marker",
            pointMarker: "circle",
            defaultPoint: {
              marker: { size: 11, outline: { width: 2, color: "white" } }
            },
            color: "black",
            points: pointsAdded
          });
        });
        // Return series if assemblies is defined
        return series;
      } else {
        // else Return empty list
        return [];
      }
    };

    return { assembliesFile, fileinput, onFileChange };
  }
});
</script>

<style scoped></style>
