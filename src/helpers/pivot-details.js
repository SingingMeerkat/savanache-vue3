export const newVisualStep = ({
                                step,
                                blockTypes,
                                selected,
                                panBlock
                              }) => {
  return {
    name: step.panBlock,
    blockTypes,
    blockClasses: selected ? ["selected"] : [],
    blockStyles: {
      // width: (panBlock.length / 4) + "px",
      width: panBlock.length + "px",
      // left: Math.max(step.startPosition, otherPanBlock  otherPanBlock.startPosition : 0, lastStep  parseInt(lastStep.blockStyles.left) + parseInt(lastStep.blockStyles.width) : 0) / 4  + 'px',
      // left: step.startPosition / 4 + "px"
      left: step.startPosition + "px"
      // backgroundColor: colors[step.panBlock].replace('{{alpha}}', alpha),
      // top: tops[step.panBlock],
    }
  };
};

export const isSelectedStep = ({
                                 step,
                                 selectedBlock,
                                 reversePanBlock,
                                 panBlock
                               }) => {
  let selected = false;
  if (step && selectedBlock && step.panBlock === selectedBlock.value.blockName) {
    selected = true;
  }
  if (reversePanBlock && selectedBlock && reversePanBlock === selectedBlock.value.blockName) {
    selected = true;
  }
  if (panBlock && selectedBlock && panBlock.coocs.includes(selectedBlock.value.blockName)) {
    selected = true;
  }
  return selected;
};

export const calculateOffset = ({
                                  comparisonStepStartPosition,
                                  pivotStepStartPosition
                                }) => {
  let pivotOffset = 0;
  let comparisonOffset = 0;
  let totalOffset = 0;
  if (comparisonStepStartPosition !== null && pivotStepStartPosition !== null) {
    if (comparisonStepStartPosition >= pivotStepStartPosition) {
      // pivotOffset = (comparisonStepStartPosition - pivotStepStartPosition) / 4;
      pivotOffset = (comparisonStepStartPosition - pivotStepStartPosition);
      comparisonOffset = 0;
    } else {
      pivotOffset = 0;
      // comparisonOffset = (pivotStepStartPosition - comparisonStepStartPosition) / 4;
      comparisonOffset = (pivotStepStartPosition - comparisonStepStartPosition);
    }
    // totalOffset = (Math.min(comparisonStepStartPosition ? comparisonStepStartPosition : pivotStepStartPosition, pivotStepStartPosition) / 4) + Math.max(pivotOffset, comparisonOffset);
    totalOffset = (Math.min(comparisonStepStartPosition ? comparisonStepStartPosition : pivotStepStartPosition, pivotStepStartPosition)) + Math.max(pivotOffset, comparisonOffset);
  }
  return { pivotOffset, comparisonOffset, totalOffset };
};