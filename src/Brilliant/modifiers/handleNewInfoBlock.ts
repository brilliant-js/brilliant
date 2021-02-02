import changeCurrentBlockType from './changeCurrentBlockType';

const handleNewInfoBlock = editorState => {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const currentBlock = contentState.getBlockForKey(key);
  const matchData = /^:::([\w-]+)?$/.exec(currentBlock.getText());
  const isLast = selection.getEndOffset() === currentBlock.getLength();
  if (matchData && isLast) {
    const data = {};
    const infotype = matchData[1];
    if (infotype) {
      (data as any).infotype = infotype;
    }
    return changeCurrentBlockType(editorState, 'info-block', '', data);
  }
  return editorState;
};

export default handleNewInfoBlock;
