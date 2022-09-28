<template>
  <div ref="pavMatrixDiv">
    <svg id="pavMatrix" ref="PanacheSvgContainer">
      <!-- DEFS FOR THE WHITE TO TRANSPARENT LEGEND BACKGROUNDS -->
      <defs>
        <linearGradient v-for="gradient in bgGradients" :id="`bgLabelGradient_${gradient.side}`" :key="gradient.side"
                        :x1="gradient.x1" :x2="gradient.x2" y1="0" y2="0">
          <stop v-for="stop in stops" :key="`offset_${stop.offset}`" :offset="stop.offset" :stop-color="stop.color"
                :stop-opacity="stop.opacity" />
        </linearGradient>
      </defs>
      <!-- PAV BLOCKS -->
      <g v-for="(genome, index) in genomeList" :id="`presence_${genome}`" :key="`geno_${genome}`">
        <rect v-for="(block, idxInArray) in filteredData"
              :key="`idxForMatrix_${idxInArray}`"
              :fill="colorScaleFunction(block)"
              :height="blocksDimensions.height"
              :opacity="calcPavBlockOpacity(block[`${genome}`])"
              :transform="writeTranslateWithOffSet(0,0)"
              :width="ntToPx(block.FeatureStop - block.FeatureStart)"
              :x="ntToPx(block.index)"
              :y="applyOffset(index * blocksDimensions.height)"
              class="movableBlock"
        />
      </g>
      <!-- LEGENDS AND BG PANELS FOR CHROMOSOME NAMES -->
      <g id="genomeLegend"
         ref="genomeLegend"
         :transform="writeTranslate(0, -this.blockOffset)"
         @mouseout="function() {eventFadeInRef('genomeLegend')}"
         @mouseover="function() {eventFadeOutRef('genomeLegend')}">
        <rect
          ref="rectToWatchInPavMatrix"
          :fill="`url(#bgLabelGradient_left)`"
          :height="pavMatrixHeight + 1"
          :transform="writeTranslate(0, this.blockOffset)"
          :width="genoLegendPanelWidth"
          x="0"
          y="0"
        />
        <text v-for="(genome, index) in genomeList"
              :key="`genomeLabel_${genome}`"
              :y="(index * blocksDimensions.height) + 3"
              dominant-baseline="hanging"
              font-family="sans-serif"
              font-size="10px"
              text-anchor="start"
              x="2"
        >
          {{ genome }}
        </text>
      </g>

      <!-- VERTICAL SLIDER FOR THE PAV MATRIX -->
      <g v-show="totMatrixIsHigherThanSvgheight" ref="pavConditionalSlider"
         :transform="writeTranslate(svgContainerWidth-10, 0)"
         opacity="0">
        <line :stroke="hclToRgb(0,0,25)" :y2="pavMatrixHeight - 10" stroke-linecap="round" stroke-opacity="0.3"
              stroke-width="10px"
              y1="10" />
        <line :stroke="hclToRgb(0,0,95)" :y2="pavMatrixHeight - 10" stroke-linecap="round" stroke-width="8px" y1="10" />
        <circle :cy="handleCyPos" :fill="hclToRgb(0,0,100)" :stroke="hclToRgb(0,0,25)" r="7" stroke-opacity="0.3"
                stroke-width="1.25px" />
        <line :y2="`${pavMatrixHeight}`" cursor="ns-resize" stroke="transparent" stroke-width="120px" y1="0" />
      </g>

    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import { mapActions, mapState } from "vuex";

export default {
  name: "PavMatrix.vue",
  props: {
    genomeList: {
      type: Array,
      //Default must not be empty, so that length > 0 !
      default: () => ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    },
    filteredData: {
      type: Array,
      default: () => []
    },
    firstNtToDisplay: {
      type: Number,
      default: 0
    },
    displaySizeOfNt: {
      type: Number,
      required: true
    },
    blocksDimensions: {
      type: Object,
      default: function() {
        return { width: 20, height: 14 };
      }
    },
    colorScaleFunction: {
      type: Function,
      default: () => "purple"
    }
  },
  data() {

    let longestSizeOfGenoName = Math.max(...this.genomeList.map(d => d.length));
    let genoLegendPanelWidth = longestSizeOfGenoName * 10;

    return {
      //heightOfTotBlocks: heightOfTotBlocks,
      stops: [
        {
          offset: 0,
          color: "white",
          opacity: 1
        },
        {
          offset: 0.6,
          color: "white",
          opacity: 1
        },
        {
          offset: 1,
          color: "white",
          opacity: 0
        }
      ],
      bgGradients: [
        {
          side: "left",
          x1: 0,
          x2: 1
        },
        {
          side: "right",
          x1: 1,
          x2: 0
        }
      ],
      genoLegendPanelWidth: genoLegendPanelWidth,
      pavMatrixHeight: 100,
      svgContainerWidth: 100,
      //resizeObserver, cf: https://stackoverflow.com/questions/43813731/how-to-trigger-an-event-when-element-is-resized-in-vue-js
      resizeObserver: null
    };
  },
  computed: {
    ...mapState("panache", {
      blockOffset: "yOffsetOfPavBlocks"
    }),
    heightOfTotBlocks() {
      return this.blocksDimensions.height * this.genomeList.length;
    },
    totMatrixIsHigherThanSvgheight() {
      return this.heightOfTotBlocks > this.pavMatrixHeight;
    },
    blockVerticalOffsetToSliderScale() {
      let scale = d3.scaleLinear() //Attaches to each threshold value a position on the slider
        .domain([0, this.heightOfTotBlocks - this.pavMatrixHeight]) //The offset should not allow hiding the bottom of the matrix, hence '- pavMatrixHeight'
        .range([10, this.pavMatrixHeight - 10]) //The scrolling bar will have the same height than the PA matrix svg, minus 2*10px
        .clamp(true);

      return scale;
    },
    handleCyPos() {
      return this.blockVerticalOffsetToSliderScale(this.blockOffset);
    }
  },
  watch: {},
  mounted() {

    //Add listener for resize event of the svg, to then update this.pavMatrixHeight
    this.resizeObserver = new ResizeObserver(this.onResize).observe(this.$refs.PanacheSvgContainer);

    // Set values linked to parent div size
    //this.pavMatrixHeight = this.$refs.PanacheSvgContainer.clientHeight;
    //console.log({clientHeight: this.$refs.PanacheSvgContainer.clientHeight});
    this.svgContainerWidth = this.$refs.PanacheSvgContainer.clientWidth;

    //Applying the drag event on the rect of conditional slider
    let self = this;
    d3.select(this.$refs["pavConditionalSlider"])
      .call(d3.drag().on("start drag", function() {
        //console.log({yPosOfMouse: d3.event.y});
        self.updateBlockOffset(d3.event.y);
      }))
      .on("mouseover", function() {
        self.eventFadeInRef("pavConditionalSlider");
      })
      .on("mouseout", function() {
        self.eventFadeOutRef("pavConditionalSlider");
      });

  },
  updated() {
  },
  unmounted() {


    delete this.resizeObserver;
  },
  methods: {
    ...mapActions([
      "updateYOffsetOfPavBlocks"
    ]),
    updateBlockOffset(mousePos) {
      this.updateYOffsetOfPavBlocks(this.blockVerticalOffsetToSliderScale.invert(mousePos));
    },
    applyOffset(initialPos) {
      return initialPos - this.blockOffset;
    },
    ntToPx(ntAmount) {
      return ntAmount * this.displaySizeOfNt;
    },
    calcPavBlockOpacity(pavEntry) {
      //pavEntry can be a Number or a String (eg. a genome name)
      if (isNaN(Number(pavEntry))) {
        //pavEntry not being a Number --> it is a String --> it is present
        return 1;
      } else {
        //pavEntry is either 0, 1 , a float in between or a higher Number
        //if >1, opacity will be set to 1 anyway
        return pavEntry;
      }
    },
    FeatureWidth(data) {
      return Number(data.FeatureStop) - Number(data.FeatureStart);
    },
    writeTranslate(x = 0, y = 0) {
      return `translate(${x},${y})`;
    },
    writeTranslateWithOffSet(x = 0, y = 0) {
      let offsetX = this.ntToPx(this.firstNtToDisplay);
      return this.writeTranslate(x - offsetX, y);
    },
    hclToRgb(h, c, l) {
      let color = d3.hcl(h, c, l);
      return `${d3.rgb(color)}`;
    },
    selectSvgFromRefs(refName) {
      let ref = this.$refs[refName];
      let svgToSelect;

      if (Array.isArray(ref)) {
        svgToSelect = ref[0];
      } else {
        svgToSelect = ref;
      }

      return svgToSelect;
    },
    eventFadeOutRef(refName) {
      let svgToSelect = this.selectSvgFromRefs(refName);

      d3.select(svgToSelect)
        .transition()
        .attr("opacity", 0);
    },
    eventFadeInRef(refName) {
      let svgToSelect = this.selectSvgFromRefs(refName);

      d3.select(svgToSelect)
        .transition()
        .attr("opacity", 1);
    },
    onResize() {
      //this.$emit('resize', this.$refs.myElement.offsetHeight)
      this.$emit("resize", this.$refs.PanacheSvgContainer.clientHeight);
      //console.log('I HAVE BEEN RESIZED - Height: ', this.$refs.PanacheSvgContainer.clientHeight);
      //console.log('I HAVE BEEN RESIZED - Width: ', this.$refs.PanacheSvgContainer.clientWidth);
      this.pavMatrixHeight = this.$refs.PanacheSvgContainer.clientHeight;
    }
  }
};
</script>

<style>

#pavMatrix {
  height: 100%;
  width: 100%;
}

</style>
