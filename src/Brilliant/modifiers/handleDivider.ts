import changeCurrentBlockType from './changeCurrentBlockType';

const handleDivider = editorState => {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const currentBlock = contentState.getBlockForKey(key);
  const matchData = /^---([\w-]+)?$/.exec(currentBlock.getText());
  const isLast = selection.getEndOffset() === currentBlock.getLength();
  if (matchData && isLast) {
    const data = {};
    const type = matchData[1];
    if (type) {
      (data as any).type = type;
    }
    return changeCurrentBlockType(editorState, 'divider', '', data);
  }
  return editorState;
};

export default handleDivider;
