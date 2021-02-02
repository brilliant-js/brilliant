import { EditorState, RawDraftContentState } from 'draft-js';
import { ControlItems } from './controlsItem';

export interface BrilliantProps {
  value?: EditorState;
  editorRef?: React.MutableRefObject<any>;
  imgControls?: boolean;
  handleImgUpload?: (file: FormData) => Promise<{ url: any; id: any }>;
  onEditorChange?: (editorState: EditorState) => void;
  style?: React.CSSProperties;
  excludeFixedControls?: ControlItems;
  excludeFloatControls?: ControlItems;
  readOnly?: boolean;
  disableFloatControls?: boolean;
  disableFixedControls?: boolean;
  language?: 'zh' | 'zh-hant' | 'en';
}

export interface BlockType {
  data: any;
  depth: number;
  key: string;
  inlineStyleRanges: { offset: number; length: number; style: string }[];
  entityRanges: { offset: number; length: number; key: string }[];
  text: string;
  type: string;
}

export interface InlineStyle {
  BOLD: Array<any>;
  ITALIC: Array<any>;
  UNDERLINE: Array<any>;
  STRIKETHROUGH: Array<any>;
  CODE: Array<any>;
  SUPERSCRIPT: Array<any>;
  SUBSCRIPT: Array<any>;
  COLOR: Array<any>;
  BGCOLOR: Array<any>;
  FONTSIZE: Array<any>;
  FONTFAMILY: Array<any>;
  length?: number;
}

export interface EditorFunction {
  getHtmlValue(): string;
  getMarkdown(): string;
  getRawValue(): RawDraftContentState;
  myEditorState?: EditorState;
}

export interface BetweenLink {
  entityKey: string;
  blockKey: string;
  url: string;
}

declare module 'draft-js' {
  interface EditorState {
    createFrom: () => {};
    toRAW?: any;
    toHTML?: any;
    toMarkdown?: any;
    toText?: any;
  }
}
