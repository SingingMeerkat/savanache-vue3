<template>
  <div>
    <!--    <b-form-group label="Tagged input using dropdown" label-for="tags-with-dropdown">-->
    <b-form-group class="noMarginBottom">
      <b-form-tags id="tags-with-dropdown" v-model="tagNames" class="revokeBootstrapCSS" no-outer-focus>
        <template v-slot="{ tags, disabled, addTag, removeTag }">
          <!-- SEARCH BAR -->
          <b-dropdown block class="mb-2" menu-class="w-100" size="sm" variant="outline-secondary">
            <template #button-content>
              <b-icon icon="tag-fill"></b-icon>
              Select annotation(s)
            </template>
            <b-dropdown-form @submit.stop.prevent="() => {}">
              <b-form-group
                :disabled="disabled"
                class="mb-2 displayBlock"
                label="Search annotations"
                label-cols-md="auto"
                label-for="tag-search-input"
                label-size="sm"
              >
                <b-form-input
                  id="tag-search-input"
                  v-model="search"
                  autocomplete="off"
                  size="sm"
                  type="search"
                ></b-form-input>
              </b-form-group>
            </b-dropdown-form>
            <b-dropdown-divider></b-dropdown-divider>
            <!-- AVAILABLE OPTIONS IN SEARCH BAR -->
            <b-dropdown-item-button
              v-for="option in matchingAnnotNames"
              :key="option"
              @click="onOptionClick({ option, addTag })"
            >
              <div class="ellipsis">{{ option }}</div>
            </b-dropdown-item-button>
            <!-- INFORMATIONS ABOUT YOUR RESEARCH -->
            <b-dropdown-text v-if="searchCriteria.length >= searchMinChar && matchingAnnotNames.length === 0">
              There are no tags available to select
            </b-dropdown-text>
            <b-dropdown-text v-else-if="searchCriteria.length < searchMinChar && matchingAnnotNames.length === 0">
              The research should be at least {{ searchMinChar }} characters long
            </b-dropdown-text>
          </b-dropdown>

          <!-- SORTING BUTTON -->
          <b-button v-show="tagNames.length > 0"
                    block
                    class="mb-2 buttonPanache"
                    size="sm"
                    @click="sortByTags">
            Sort with tags
          </b-button>

          <!-- POPUP OF INFORMATIONS ABOUT THE GENOMES -->
          <div v-show="hasSearchHappened">
            <b-button
              id="popover-target-1"
              block
              class="mb-2 buttonPanache"
              size="sm">
              Informations about search
            </b-button>
            <b-popover placement="top" target="popover-target-1" triggers="hover">
              <template #title>Search criteria percentages</template>
              <div v-for="genomeInfo in popupDiv" :key="genomeInfo">
                {{ genomeInfo }}
              </div>
            </b-popover>
          </div>

          <!-- LIST OF THE ANNOT TAGS THAT ARE SELECTED AS FILTER(S) -->
          <div :key="componentKey">
            <b-input-group v-for="tag in tags" v-show="mapOfPresenceStatus.has(tag)" :key="tag" :prepend="mapOfPresenceStatus.get(tag) ? 'Presence' : 'Absence'"
                           class="mb-2 tagCustomCSS" size="sm">
              <b-input-group-prepend is-text>
                <!-- CHECKBOX TO CHANGE THE DESIRED PRESENCE STATUS OF THE ANNOT -->
                <b-form-checkbox
                  :id="'switch_' + tag"
                  :checked="mapOfPresenceStatus.get(tag)"
                  :class="'noBorderLeft'"
                  class="mr-n2 noBorderLeft"
                  switch
                  @change="updateStatus(tag)">
                </b-form-checkbox>
              </b-input-group-prepend>
              <b-form-input :placeholder="tag" aria-label="Large text input with switch" class="inputTag"
                            disabled></b-form-input>
              <b-input-group-append is-text>
                <b-icon class="cursorP" icon="x" @click="removeTag(tag)" />
              </b-input-group-append>
            </b-input-group>
          </div>
        </template>
      </b-form-tags>
    </b-form-group>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { nonReactiveDataStore } from "@/store/non-reactive-data";

export default {
  name: "SortOption_GffPresenceStatus",
  data() {
    return {
      search: "",
      tagNames: [], //TODO Rename, is it the possible names for annots? Name from bootstrap tags?
      searchMinChar: 3,
      mapOfPresenceStatus: new Map(),
      hasSearchHappened: false,
      popupDiv: [],
      componentKey: 0
    };
  },
  computed: {
    ...mapState("panache", {
      annotMap: "annotMap", //TODO change to annot in store
      genomeList: "genomeListInDisplay"
    }),
    /**
     * Function that returns the research criteria.
     * @returns {string} = research criteria
     */
    searchCriteria() {
      // Compute the search criteria
      return this.search.trim().toLowerCase();
    },
    /**
     * Function that returns the named annotations matching to the research criteria.
     * @returns {Array} = list of all matching annotation names, empty if none found
     */
    matchingAnnotNames() {
      let criteria = this.searchCriteria;

      if (criteria.length >= this.searchMinChar) {
        // From annotMap, get names matching the search criteria
        let matchingNames = [...this.annotMap.keys()].filter(opt => opt.toLowerCase().indexOf(criteria) > -1);

        // Filter out already selected options
        return matchingNames.filter(opt => this.tagNames.indexOf(opt) === -1);

      } else {
        return [];
      }
    }
  },
  methods: {
    ...mapActions("panache", [
      "updateGenomesInDisplay"
    ]),
    /**
     * Add a named annot to tags (a Bootstrap.Vue list).
     * @param option = Named annot to add
     * @param addTag = function addTag of Bootstrap.Vue
     */
    onOptionClick({ option, addTag }) {
      addTag(option); // Add the annot to the tag list
      this.search = ""; // Empty the search bar
    },
    /**
     * Sort the genomes based on their scores.
     */
    sortByTags() {

      let scorePerGenome = this.applyScoresToGenomes();

      // Sort the ranking Map in function of their number of points.
      let rankGenomes = new Map([...scorePerGenome.entries()].sort((a, b) => b[1] - a[1]));

      // Update the popup displaying the scores
      this.popupDiv = []; // Clear previous info
      this.genomeList.forEach(genome => {
        this.popupDiv.push(genome + " (" + Math.round(rankGenomes.get(genome) / this.mapOfPresenceStatus.size * 100) + "%)");
      });

      // Update the store with the new genome order
      this.updateGenomesInDisplay([...rankGenomes.keys()]);
      this.hasSearchHappened = true; // Enables the info popup to appear on screen
    },
    /**
     * Update the status of research of an annotation.
     * @param annot = The annot to which you want to update the status
     */
    updateStatus(annot) {
      this.mapOfPresenceStatus.set(annot, !this.mapOfPresenceStatus.get(annot));
      this.hasSearchHappened = false; // Turn hasSearchHappened to false to not misinform the user and hide the popup
      this.forceRerender();
    },
    /**
     * Function that force area with componentKey as key to rerender.
     */
    forceRerender() {
      this.componentKey += 1;
      if (this.componentKey > 2) { // To avoid a large number
        this.componentKey = 0;
      }
    },
    /**
     * Function that parses all the annotName x presenceStatus filters and
     * computes a matching score for every genome.
     * @returns {Map} = mapOfScores[genome] --> score
     */
    applyScoresToGenomes() {
      // Map that stores the scores of each genome depending on how well they match the tags
      let mapOfScores = new Map();

      // Initializing at 0
      for (let i = 0; i < this.genomeList.length; i++) {
        mapOfScores.set(this.genomeList[i], 0);
      }

      // Ranks genomes according to their matching score with the choosen tags
      this.mapOfPresenceStatus.forEach((shouldBePresent, annotName) => {

        let annotStartStopChrom = this.annotMap.get(annotName);
        let annotStart = annotStartStopChrom[0];
        let annotStop = annotStartStopChrom[1];
        let annotChrom = annotStartStopChrom[2];
        let chromPavBlocks = [...nonReactiveDataStore.fullChromData[annotChrom]]; // Get the list of PAV blocks found in annotChrom

        // Find the blocks for which we should check the pav status
        // Here the condition is that at least a part of the block(s) should
        // overlap the annotation
        let setOfBreakpoints = new Set([annotStart]);
        let spannedBlocks = chromPavBlocks.filter(block => {

          let blockStartIsInAnnot = (annotStart <= parseInt(block.FeatureStart)) && (parseInt(block.FeatureStart) <= annotStop);
          let blockStopIsInAnnot = (annotStart <= parseInt(block.FeatureStop)) && (parseInt(block.FeatureStop) <= annotStop);
          let blockContainsAnnot = (parseInt(block.FeatureStart) <= annotStart) && (annotStop <= parseInt(block.FeatureStart));

          let isMatching = (blockStartIsInAnnot || blockStopIsInAnnot || blockContainsAnnot);

          if (isMatching) {
            setOfBreakpoints.add(Math.min(block.FeatureStart, annotStart));
            setOfBreakpoints.add(Math.max(block.FeatureStop, annotStop));
          }

          return isMatching;
        });

        // Build mapOfBlocksPerBreakpoint that lists, for all breakpoints, which
        // blocks cover the following interval
        //
        //Exemple:
        //  Annot |------------------------------------------------------------|
        //        |         |       |           |                    |
        //        <BKPT_A--><BKPT_B><BKPT_C----><BKPT_D-------------><BKPT_E--->
        //
        //    1   __________11111111111111111111________________________________
        //    2   222222222222222222222222222222222222222222222222222___________
        //    3   ______________________________333333333333333333333___________
        //    4   __________________444444444444444444444444444444444___________
        //
        // map.get(A) --> [2];
        // map.get(C) --> [1, 2, 4];
        // map.get(E) --> [];
        let mapOfBlocksPerBreakpoint = new Map();

        // Create the ordered array of breakpoints / intervals starting points
        let arrayOfBreakpoints = Array.from(setOfBreakpoints).sort((a, b) => a - b);
        arrayOfBreakpoints.pop();
        arrayOfBreakpoints.reverse(); // Will be parsed from end to start later

        // For each breakpoint, stores the blocks present in the following interval
        arrayOfBreakpoints.forEach(bkpt => {
          mapOfBlocksPerBreakpoint.set(bkpt, []);
          spannedBlocks.forEach(block => {
            // Does the [breakpoint+, nextBreakpoint[ interval has the block?
            if ((block.FeatureStart <= bkpt) || (bkpt < block.FeatureStop)) {
              mapOfBlocksPerBreakpoint.get(bkpt).push(block);
            }
          });
        });

        // Compute matching score for each genome
        this.genomeList.forEach(geno => {

          let cumulLenScore = 0;
          let nextBreakpoint = annotStop;
          let annotLength = annotStop - annotStart;

          // Parsing the breakpoints from right to left
          arrayOfBreakpoints.forEach(bkpt => {

            let intervalLength = nextBreakpoint - bkpt;
            let intervalScore = 0;
            let nbOfMatchingBlocks = 0;

            // Check PAV status of all candidate blocks
            mapOfBlocksPerBreakpoint.get(bkpt).forEach(block => {
              let pavStatus = parseInt(block[geno]);

              //Check if there is a match between desired and block presence/absence statuses
              let queryDoesMatch = (shouldBePresent && pavStatus > 0) || (!shouldBePresent && pavStatus === 0);

              if (queryDoesMatch) {
                nbOfMatchingBlocks += 1;
              }
            });

            let nbBlockInInter = mapOfBlocksPerBreakpoint.get(bkpt).length;
            if (nbBlockInInter > 0) {
              intervalScore = nbOfMatchingBlocks * intervalLength / nbBlockInInter;
            }

            cumulLenScore += intervalScore;
            nextBreakpoint = bkpt;
          });

          /*// Check PAV status of all candidate blocks
          spannedBlocks.forEach(block => {
            let pavStatus = parseInt(block[geno]);
            let leftExceedance = Math.max(block.FeatureStart - annotStart, 0);
            let rightExceedance = Math.max(annotStop - block.FeatureStop, 0);
            let overlappedLength = annotLength - leftExceedance - rightExceedance;

            //Check if there is a match between desired and block presence/absence statuses
            let queryDoesMatch = (shouldBePresent && pavStatus > 0) || (!shouldBePresent && pavStatus === 0) ;

            if (queryDoesMatch) {
              cumulLenScore += overlappedLength;
            }
          });
          */

          // The score is a float between 0 and 1, shows the proportion of the annot that matches the desired pav status
          let annotScore = cumulLenScore / annotLength;
          //console.log({cumulLenScore, annotLength, spannedBlocks})

          mapOfScores.set(geno, mapOfScores.get(geno) + annotScore);

        });

      });

      return mapOfScores;
    }
  },
  watch: {
    tagNames() {

      let currentTags = [...this.tagNames];

      // In Map, remove keys from deleted tags
      this.mapOfPresenceStatus.forEach((val, key) => {

        if (currentTags.includes(key)) {
          let idxToDel = currentTags.indexOf(key);
          currentTags.splice(idxToDel, 1);

        } else {
          this.mapOfPresenceStatus.delete(key);
        }

      });

      // Add new (key, value) according to new tag
      currentTags.forEach((annotName) => {
        this.mapOfPresenceStatus.set(annotName, true);
      });
    }
  }
};

</script>

<style lang="scss" scoped>

.width100P {
  width: 100%;
}

.revokeBootstrapCSS {
  padding: 0px;
  border: none;
}

.displayBlock {
  display: block;
}

.noMarginBottom {
  margin-bottom: 0;
}

.ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
}

.noBordeRight {
  border-right: none;
}

.noBorderLeft {
  border-left: none;
}

.cursorP {
  cursor: pointer;
}

.inputTag {
  color: #495057;
  background-color: white;
  height: 34px !important;
}

.inputTag::placeholder {
  color: #495057;
}

</style>

<style>

.tagCustomCSS .input-group-prepend:first-child .input-group-text {
  width: 78px !important;
}

</style>