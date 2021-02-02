import { EditorState, RichUtils } from 'draft-js';
import changeCurrentBlockType from './changeCurrentBlockType';

const sharps = (len: number): string => {
  let ret = '';
  while (ret.length < len) {
    ret += '#';
  }
  return ret;
};

const blockTypes = [
  null,
  'header-one',
  'header-two',
  'header-three',
  'header-four',
  'header-five',
  'header-six',
];

const handleBlockType = (
  editorState: EditorState,
  line: string
): EditorState => {
  const blockType = RichUtils.getCurrentBlockType(editorState);

  let matchArr = line.match(/^[*-] (.*)$/);
  if (matchArr) {
    return changeCurrentBlockType(
      editorState,
      'unordered-list-item',
      matchArr[1]
    );
  }
  matchArr = line.match(/^[\d]\. (.*)$/);
  if (matchArr) {
    return changeCurrentBlockType(
      editorState,
      'ordered-list-item',
      matchArr[1]
    );
  }
  matchArr = line.match(/^> (.*)$/);
  if (matchArr) {
    return changeCurrentBlockType(editorState, 'blockquote', matchArr[1]);
  }
  for (let i = 1; i <= 6; i += 1) {
    if (line.indexOf(`${sharps(i)} `) === 0 && blockType !== 'code-block') {
      return changeCurrentBlockType(
        editorState,
        blockTypes[i],
        line.replace(/^#+\s/, '')
      );
    }
  }
  return editorState;
};

export default handleBlockType;
