import { EditorState, Modifier, SelectionState } from 'draft-js';

const removeBlock = (editorState, block, lastSelection = null) => {
  let nextContentState, nextEditorState;
  const blockKey = block.getKey();

  nextContentState = Modifier.removeRange(
    editorState.getCurrentContent(),
    new SelectionState({
      anchorKey: blockKey,
      anchorOffset: 0,
      focusKey: blockKey,
      focusOffset: block.getLength(),
    }),
    'backward'
  );

  nextContentState = Modifier.setBlockType(
    nextContentState,
    nextContentState.getSelectionAfter(),
    'unstyled'
  );
  nextEditorState = EditorState.push(
    editorState,
    nextContentState,
    'remove-range'
  );
  return EditorState.forceSelection(
    nextEditorState,
    lastSelection || nextContentState.getSelectionAfter()
  );
};
export default removeBlock;
