import { EditorState } from 'draft-js';
import insertImage from './insertImage';

const handleImage = (
  editorState: EditorState,
  line,
  setEditorState: (editorState: EditorState) => void
) => {
  const re = /!\[([^\]]*)]\(([^)"]+)(?: "([^"]+)")?\)/g;
  let newEditorState = editorState;
  let matchArr;
  do {
    matchArr = re.exec(line);
    if (matchArr) {
      newEditorState = insertImage(newEditorState, matchArr, setEditorState);
    }
  } while (matchArr);
  return newEditorState;
};

export default handleImage;
