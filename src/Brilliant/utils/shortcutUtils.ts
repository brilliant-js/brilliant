import {
  Modifier,
  EditorState,
  ContentState,
  SelectionState,
  ContentBlock,
} from 'draft-js';
import leaveList from '../modifiers/leaveList';
import insertEmptyBlock from '../modifiers/insertEmptyBlock';
import handleNewCodeBlock from '../modifiers/handleNewCodeBlock';
import changeCurrentBlockType from '../modifiers/changeCurrentBlockType';
import insertText from '../modifiers/insertText';
import handleInlineStyle from '../modifiers/handleInlineStyle';
import handleBlockType from '../modifiers/handleBlockType';
import handleImage from '../modifiers/handleImage';
import handleLink from '../modifiers/handleLink';
import handleNewInfoBlock from '../modifiers/handleNewInfoBlock';
import handleIntelligentType from '../modifiers/handleIntelligentType';

const objL = {
  '(': ')',
  '[': ']',
  '{': '}',
};
const objR = {};
for (const key in objL) {
  objR[objL[key]] = key;
}

export const checkReturnForState = (
  editorState: EditorState,
  ev,
  { insertEmptyBlockOnReturnWithModifierKey }
) => {
  let newEditorState = editorState;
  const contentState = editorState.getCurrentContent();
  let selection = editorState.getSelection();
  const key = selection.getStartKey();
  const contentBlock = contentState.getBlockForKey(key);
  const type = contentBlock.getType();
  const text = contentBlock.getText();

  if (/-list-item$/.test(type) && text === '') {
    newEditorState = leaveList(editorState);
  }
  if (
    newEditorState === editorState &&
    insertEmptyBlockOnReturnWithModifierKey &&
    (ev.ctrlKey ||
      ev.shiftKey ||
      ev.metaKey ||
      ev.altKey ||
      (/^header-/.test(type) &&
        selection.isCollapsed() &&
        selection.getEndOffset() === text.length))
  ) {
    newEditorState = insertEmptyBlock(editorState);
  }

  if (
    newEditorState === editorState &&
    type !== 'code-block' &&
    /^```([\w-]+)?$/.test(text)
  ) {
    newEditorState = handleNewCodeBlock(editorState);
  }

  if (
    newEditorState === editorState &&
    type !== 'info-block' &&
    /^:::([\w-]+)?$/.test(text)
  ) {
    newEditorState = handleNewInfoBlock(editorState);
  }

  if (newEditorState === editorState && type === 'code-block') {
    if (/```([\w-+]+)?$/.test(text)) {
      newEditorState = changeCurrentBlockType(
        newEditorState,
        type,
        text.replace(/\n```([\w-+]+)?$/, '')
      );
      newEditorState = insertEmptyBlock(newEditorState);
    } else {
      const {
        currentContent,
        leftText,
        rightText,
      } = getContentSelectionAmbient(editorState);
      const bracketNumber = validBracket(leftText);
      if (bracketNumber) {
        if (objL[leftText[leftText.length - 1]] && objR[rightText[0]]) {
          newEditorState = insertText(
            editorState,
            `\n${'  '.repeat(bracketNumber)}\n${'  '.repeat(bracketNumber - 1)}`
          );

          selection = newEditorState.getSelection();
          selection = selection.merge({
            anchorOffset: selection.get('anchorOffset') - bracketNumber * 2 + 1,
            focusOffset: selection.get('anchorOffset') - bracketNumber * 2 + 1,
          });
          newEditorState = EditorState.acceptSelection(
            newEditorState,
            selection
          );
        } else {
          newEditorState = insertText(
            editorState,
            `\n${'  '.repeat(bracketNumber)}`
          );
        }
      } else {
        newEditorState = insertText(editorState, '\n');
      }
    }
  }

  if (newEditorState === editorState && type === 'info-block') {
    if (/:::\s*$/.test(text)) {
      newEditorState = changeCurrentBlockType(
        newEditorState,
        type,
        text.replace(/\n:::\s*$/, '')
      );
      newEditorState = insertEmptyBlock(newEditorState);
    } else {
      newEditorState = insertText(editorState, '\n');
    }
  }

  return newEditorState;
};

export const checkCharacterForState = (
  editorState: EditorState,
  line: string,
  setEditorState?: (editorState: EditorState) => void
): EditorState => {
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const currentBlock = contentState.getBlockForKey(key);
  const type = currentBlock.getType();

  let newEditorState = handleBlockType(editorState, line);

  if (editorState === newEditorState) {
    newEditorState = handleImage(editorState, line, setEditorState);
  }
  if (editorState === newEditorState) {
    newEditorState = handleLink(editorState, line);
  }
  if (editorState === newEditorState && type !== 'code-block') {
    newEditorState = handleInlineStyle(editorState, line);
  }
  return newEditorState;
};

export function replaceText(
  editorState: EditorState,
  bufferText: string
): EditorState {
  const contentState = Modifier.replaceText(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    bufferText
  );
  return EditorState.push(editorState, contentState, 'insert-characters');
}
export interface ContentSelectionAmbient {
  currentContent: ContentState;
  selection: SelectionState;
  leftOffset: number;
  leftBlockKey: string;
  leftBlock: ContentBlock;
  leftText: string;
  rightOffset: number;
  rightBlockKey: string;
  rightBlock: ContentBlock;
  rightText: string;
  selectedText: string;
}

export function getContentSelectionAmbient(
  editorState: EditorState
): ContentSelectionAmbient {
  const selection = editorState.getSelection();
  const currentContent = editorState.getCurrentContent();

  const leftBlockKey = selection.getStartKey();
  const leftBlock = currentContent.getBlockForKey(leftBlockKey);

  const leftBlockText = leftBlock.getText();
  const leftOffset = selection.getStartOffset();

  const leftText = leftBlockText.slice(0, leftOffset);

  const rightBlockKey = selection.getEndKey();
  const rightBlock = currentContent.getBlockForKey(rightBlockKey);

  const rightBlockText = rightBlock.getText();
  const rightOffset = selection.getEndOffset();

  const rightText = rightBlockText.slice(rightOffset);

  const selectedText = leftBlockText.slice(leftOffset, rightOffset);

  return {
    currentContent,
    selection,
    leftOffset,
    leftBlockKey,
    leftBlock,
    leftText,
    rightOffset,
    rightBlockKey,
    rightBlock,
    rightText,
    selectedText,
  };
}

const validBracket = (text: string): number => {
  const stack = [];
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (objL[char]) {
      stack.push(char);
    } else if (objR[char]) {
      if (stack[stack.length - 1] !== objR[char]) {
        break;
      } else {
        stack.pop();
      }
    }
  }
  return stack.length;
};

export function handleCodePasting(
  editorState: EditorState,
  text: string
): EditorState {
  let { currentContent, selection, leftBlock } = getContentSelectionAmbient(
    editorState
  );

  if (leftBlock.getType() === 'code-block') {
    if (!selection.isCollapsed()) {
      editorState = EditorState.push(
        editorState,
        Modifier.replaceText(currentContent, selection, text),
        'insert-characters'
      );
    } else {
      editorState = EditorState.push(
        editorState,
        Modifier.insertText(currentContent, selection, text),
        'insert-characters'
      );
    }
  }
  return editorState;
}
