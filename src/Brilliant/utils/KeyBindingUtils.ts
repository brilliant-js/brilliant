import {
  DraftEditorCommand,
  DraftHandleValue,
  EditorState,
  RichUtils,
} from 'draft-js';
import { SyntheticKeyboardEvent, EventStyleMap } from '../cosntants/typeMaps';

export const handleMyKeyBindingFn = (
  e: React.KeyboardEvent<{}>,
  getDefaultKeyBinding: (e: SyntheticKeyboardEvent) => DraftEditorCommand | null
): string => {
  if (e.keyCode === 13) return getDefaultKeyBinding(e);
  if (e.ctrlKey) {
    switch (e.keyCode) {
      case 83:
        return EventStyleMap.SAVE.EVENT;
      case 48:
        return EventStyleMap.UNSTYLED.EVENT;
      case 49:
        return EventStyleMap.H1.EVENT;
      case 50:
        return EventStyleMap.H2.EVENT;
      case 51:
        return EventStyleMap.H3.EVENT;
      case 52:
        return EventStyleMap.H4.EVENT;
      case 53:
        return EventStyleMap.H5.EVENT;
      case 54:
        return EventStyleMap.H6.EVENT;
      case 55:
        return EventStyleMap.UNORDER_LIST.EVENT;
      case 56:
        return EventStyleMap.ORDER_LIST.EVENT;
      case 229:
        return EventStyleMap.FOCUS.EVENT;
      case 69:
        return EventStyleMap.CODE.EVENT;
      case 72:
        return EventStyleMap.HIGHLIGHT.EVENT;
      case 220:
        return EventStyleMap.CLEARSTYLE.EVENT;
      case 192:
        return EventStyleMap.CODEBLOCK.EVENT;
      case 190:
        if (e.shiftKey) return EventStyleMap.BLOCKQUOTE.EVENT;
        break;
      case 88:
        if (e.shiftKey) return EventStyleMap.STRIKETHROUGH.EVENT;
        break;
      case 76:
        if (e.shiftKey) return EventStyleMap.TOLEFT.EVENT;
        break;
      case 67:
        if (e.shiftKey) return EventStyleMap.TOCENTER.EVENT;
        break;
      case 82:
        if (e.shiftKey) return EventStyleMap.TORIGHT.EVENT;
        break;
      default:
        return getDefaultKeyBinding(e);
    }
  }
};

export interface IhandleMyKeyCommand {
  command: string;
  editorState: EditorState;

  myToggleInlineStyle: (type: string) => void;
  myToggleBlockType: (type: string) => void;
  focus: any;
  setEditorState: any;
}

export const handleMyKeyCommand = (
  props: IhandleMyKeyCommand
): DraftHandleValue => {
  const {
    command,
    editorState,
    focus,
    myToggleBlockType,
    myToggleInlineStyle,
    setEditorState,
  } = props;
  const newState = RichUtils.handleKeyCommand(editorState, command);
  if (newState) {
    setEditorState(newState);
    return 'handled';
  }
  switch (command) {
    case EventStyleMap.SAVE.EVENT:
      return 'handled';
    case 'myeditor-space':
      return 'handled';
    case EventStyleMap.UNSTYLED.EVENT:
      myToggleBlockType(EventStyleMap.UNSTYLED.TYPE);
      return 'handled';
    case EventStyleMap.H1.EVENT:
      myToggleBlockType(EventStyleMap.H1.TYPE);
      return 'handled';
    case EventStyleMap.H2.EVENT:
      myToggleBlockType(EventStyleMap.H2.TYPE);
      return 'handled';
    case EventStyleMap.H3.EVENT:
      myToggleBlockType(EventStyleMap.H3.TYPE);
      return 'handled';
    case EventStyleMap.H4.EVENT:
      myToggleBlockType(EventStyleMap.H4.TYPE);
      return 'handled';
    case EventStyleMap.H5.EVENT:
      myToggleBlockType(EventStyleMap.H5.TYPE);
      return 'handled';
    case EventStyleMap.H6.EVENT:
      myToggleBlockType(EventStyleMap.H6.TYPE);
      return 'handled';
    case EventStyleMap.UNORDER_LIST.EVENT:
      myToggleBlockType(EventStyleMap.UNORDER_LIST.TYPE);
      return 'handled';
    case EventStyleMap.ORDER_LIST.EVENT:
      myToggleBlockType(EventStyleMap.ORDER_LIST.TYPE);
      return 'handled';
    case EventStyleMap.FOCUS.EVENT:
      focus();
      return 'handled';
    case EventStyleMap.CODE.EVENT:
      myToggleInlineStyle(EventStyleMap.CODE.TYPE);
      return 'handled';
    case EventStyleMap.HIGHLIGHT.EVENT:
      myToggleInlineStyle(EventStyleMap.HIGHLIGHT.TYPE);
      return 'handled';
    case EventStyleMap.CLEARSTYLE.EVENT:
      myToggleInlineStyle(EventStyleMap.CLEARSTYLE.TYPE);
      return 'handled';
    case EventStyleMap.CODEBLOCK.EVENT:
      myToggleBlockType(EventStyleMap.CODEBLOCK.TYPE);
      return 'handled';
    case EventStyleMap.BLOCKQUOTE.EVENT:
      myToggleBlockType(EventStyleMap.BLOCKQUOTE.TYPE);
      return 'handled';
    case EventStyleMap.STRIKETHROUGH.EVENT:
      myToggleInlineStyle(EventStyleMap.STRIKETHROUGH.TYPE);
      return 'handled';
    case EventStyleMap.TOLEFT.EVENT:
      myToggleBlockType(EventStyleMap.TOLEFT.TYPE);
      return 'handled';
    case EventStyleMap.TOCENTER.EVENT:
      myToggleBlockType(EventStyleMap.TOCENTER.TYPE);
      return 'handled';
    case EventStyleMap.TORIGHT.EVENT:
      myToggleBlockType(EventStyleMap.TORIGHT.TYPE);
      return 'handled';
    default:
      break;
  }

  return 'not-handled';
};

export default { handleMyKeyBindingFn, handleMyKeyCommand };
