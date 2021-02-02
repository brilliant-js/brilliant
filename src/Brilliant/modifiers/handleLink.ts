import insertLink from './insertLink';

const handleLink = (editorState, line) => {
  const re = /\[([^\]]+)]\(([^)"]+)(?: "([^"]+)")?\)/g;
  let newEditorState = editorState;
  let matchArr;
  do {
    matchArr = re.exec(line);
    if (matchArr) {
      newEditorState = insertLink(newEditorState, matchArr);
    }
  } while (matchArr);
  return newEditorState;
};

export default handleLink;
