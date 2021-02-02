import { EditorState, RawDraftContentState } from 'draft-js';
import { createFromHtml } from '../exports/htmlToDraft/htmlToDraft';
import { createFromMarkdown } from '../exports/markdownToDraft/markdownToDraft';

export enum initValueType {
  HTML = 'HTML',
  Markdown = 'Markdown',
  EditorState = 'EditorState',
  Raw = 'Raw',
}
export const createFrom = (
  content?: string | Object | EditorState | RawDraftContentState,
  type?: 'HTML' | 'Markdown' | 'EditorState' | 'Raw'
): EditorState => {
  let editorState = null;
  if (content && type) {
    if (content instanceof EditorState) {
      editorState = content;
    } else if (typeof content === 'object' && type === initValueType.Raw) {
      editorState = EditorState.createWithContent(content as any);
    } else if (typeof content === 'string' && type === initValueType.HTML) {
      editorState = createFromHtml(content);
    } else if (typeof content === 'string' && type === initValueType.Markdown) {
      editorState = createFromMarkdown(content);
    } else {
      editorState = EditorState.createEmpty();
    }
  } else {
    editorState = EditorState.createEmpty();
  }
  return editorState;
};
