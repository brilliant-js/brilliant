import { EditorState, RichUtils, SelectionState, Modifier } from 'draft-js';

const insertLink = (editorState: EditorState, matchArr) => {
  const currentContent = editorState.getCurrentContent();
  let selection = editorState.getSelection();
  const key = selection.getStartKey();
  const [matchText, text, href, title] = matchArr;
  const { index } = matchArr;
  const focusOffset = index + matchText.length;
  const wordSelection = SelectionState.createEmpty(key).merge({
    anchorOffset: index,
    focusOffset,
  });

  const newSrc = href.indexOf('http') < 0 ? `https://${href}` : href;
  const entityKey = editorState
    .getCurrentContent()
    .createEntity('LINK', 'MUTABLE', { url: newSrc })
    .getLastCreatedEntityKey();

  const contentState = Modifier.replaceText(
    editorState.getCurrentContent(),
    wordSelection,
    `${text}`,
    editorState.getCurrentInlineStyle(),
    entityKey
  );
  let newEditorState = EditorState.push(
    editorState,
    contentState,
    'insert-characters'
  );

  selection = newEditorState.getSelection().merge({
    anchorOffset: wordSelection.get('anchorOffset') + text.length,
    focusOffset: wordSelection.get('anchorOffset') + text.length,
  });

  newEditorState = EditorState.acceptSelection(newEditorState, selection);
  return EditorState.forceSelection(
    newEditorState,
    newEditorState.getCurrentContent().getSelectionAfter()
  );
};

export default insertLink;
