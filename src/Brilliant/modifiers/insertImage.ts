import {
  EditorState,
  RichUtils,
  SelectionState,
  Modifier,
  AtomicBlockUtils,
} from 'draft-js';

const insertImage = (editorState: EditorState, matchArr, setEditorState) => {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const [matchText, alt, src, title] = matchArr;
  const { index } = matchArr;
  const focusOffset = index + matchText.length;
  const wordSelection = SelectionState.createEmpty(key).merge({
    anchorOffset: index,
    focusOffset,
  });
  const contentStateWithEntity = contentState.createEntity(
    'IMAGE',
    'IMMUTABLE',
    {
      alt,
      src,
      title,
    }
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  let newContentState = Modifier.replaceText(
    contentStateWithEntity,
    wordSelection,
    '\u200B',
    null,
    entityKey
  );
  newContentState = Modifier.insertText(
    newContentState,
    newContentState.getSelectionAfter(),
    ''
  );
  const newWordSelection = wordSelection.merge({
    focusOffset: index + 1,
  });
  let newEditorState = EditorState.push(
    editorState,
    newContentState,
    'insert-characters'
  );
  newEditorState = RichUtils.toggleLink(
    newEditorState,
    newWordSelection,
    entityKey
  );
  newEditorState = AtomicBlockUtils.insertAtomicBlock(
    newEditorState,
    entityKey,
    ' '
  );
  newContentState = newEditorState.getCurrentContent();
  return EditorState.forceSelection(
    newEditorState,
    newContentState.getSelectionAfter()
  );
};

export default insertImage;
