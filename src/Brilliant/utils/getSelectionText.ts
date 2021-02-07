import { EditorState } from "draft-js";

export function getSelectedBlocksMap(editorState: EditorState) {
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  const blockMap = contentState.getBlockMap();
  return blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]]);
}

export function getSelectedBlocksList(editorState: EditorState) {
  return getSelectedBlocksMap(editorState).toList();
}

export function getSelectionText(editorState: EditorState) {
  let selectedText = '';
  const currentSelection = editorState.getSelection();
  let start = currentSelection.getAnchorOffset();
  let end = currentSelection.getFocusOffset();
  const selectedBlocks = getSelectedBlocksList(editorState);
  if (selectedBlocks.size > 0) {
    if (currentSelection.getIsBackward()) {
      const temp = start;
      start = end;
      end = temp;
    }
    for (let i = 0; i < selectedBlocks.size; i += 1) {
      const blockStart = i === 0 ? start : 0;
      const blockEnd =
        i === selectedBlocks.size - 1
          ? end
          : selectedBlocks.get(i).getText().length;
      selectedText += `${selectedBlocks
        .get(i)
        .getText()
        .slice(blockStart, blockEnd)}\n`;
    }
  }
  return selectedText.replace(/\n{1}$/,'');
}
