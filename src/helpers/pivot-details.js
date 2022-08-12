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
      width: (panBlock.length / 4) + "px",
      // left: Math.max(step.startPosition, otherPanBlock  otherPanBlock.startPosition : 0, lastStep  parseInt(lastStep.blockStyles.left) + parseInt(lastStep.blockStyles.width) : 0) / 4  + 'px',
      left: step.startPosition / 4 + "px"
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
                                  otherPanBlock,
                                  step,
                                  selectedBlock
                                }) => {
  let pivotOffset = 0;
  let assemblyOffset = 0;
  let totalOffset = 0;
  if (otherPanBlock && step.panBlock === selectedBlock.value.blockName) {
    if (otherPanBlock.startPosition >= step.startPosition) {
      pivotOffset = (otherPanBlock.startPosition - step.startPosition) / 4;
      assemblyOffset = 0;
    } else {
      pivotOffset = 0;
      assemblyOffset = (step.startPosition - otherPanBlock.startPosition) / 4;
    }
  }
  totalOffset = (Math.min(otherPanBlock ? otherPanBlock.startPosition : step.startPosition, step.startPosition) / 4) + Math.max(pivotOffset, assemblyOffset);
  return { pivotOffset, assemblyOffset, totalOffset };
};