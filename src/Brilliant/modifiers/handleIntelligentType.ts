import { EditorState } from 'draft-js';
import changeCurrentInlineStyle from './changeCurrentInlineStyle';

const inlineMatchers = {
  BOLD: /(?:^||\n|[^A-z0-9_*~`])(\*{2}|_{2})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
  ITALIC: /(?:^||\n|[^A-z0-9_*~`])(\*{1}|_{1})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
  CODE: /(?:^||\n|[^A-z0-9_*~`])(`)((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
  STRIKETHROUGH: /(?:^||\n|[^A-z0-9_*~`])(~{2})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
  HIGHLIGHT: /(?:^||\n|[^A-z0-9_*~`])(={2}|_{2})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
};

const inlineMatchers1 = {
  BOLD: /(?:^||\n|[^A-z0-9_*~`])(\*{2}|_{2})((?!\1).*?)(\1)(?:$|\s|\n|[^A-z0-9_*~`])/g,
  ITALIC: /(?:^||\n|[^A-z0-9_*~`])(\*{1}|_{1})((?!\1).*?)(\1)(?:$|\s|\n|[^A-z0-9_*~`])/g,
  CODE: /(?:^||\n|[^A-z0-9_*~`])(`)((?!\1).*?)(\1)(?:$|\s|\n|[^A-z0-9_*~`])/g,
  STRIKETHROUGH: /(?:^||\n|[^A-z0-9_*~`])(~{2})((?!\1).*?)(\1)(?:$|\s|\n|[^A-z0-9_*~`])/g,
};

const handleIntelligentType = (editorState: EditorState, line) => {
      let newEditorState = editorState;
                  
  return newEditorState;
};

export default handleIntelligentType;
