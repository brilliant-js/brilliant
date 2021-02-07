import { getDefaultKeyBinding, Modifier } from 'draft-js';
import {
  ContentBlock,
  DraftBlockRenderMap,
  DraftDecorator,
  DraftHandleValue,
  EditorState,
  RichUtils,
} from 'draft-js';
import { setBlockData } from 'draftjs-utils';
import Editor, { PluginFunctions } from 'draft-js-plugins-editor';
import { KeyboardEvent } from 'react';
import CodeBlock from '../../../Brilliant/components/CodeBlock/CodeBlock';
import { CodeLanguageSelect } from '../../../Brilliant/components/CodeBlock/CodeLanguageSelect';
import {
  handleMyKeyBindingFn,
  handleMyKeyCommand,
  IhandleMyKeyCommand,
} from '../../../Brilliant/utils/KeyBindingUtils';
import { SyntheticKeyboardEvent } from '../../../Brilliant/cosntants/typeMaps';
import InfoBlock from '../../../Brilliant/components/InfoBlock/InfoBlock';
import DividerLine from '../../../Brilliant/components/DividerLine/DividerLine';
import MediaBox from '../../../Brilliant/components/MediaBox/MediaBox';
import {
  checkCharacterForState,
  checkReturnForState,
} from '../../../Brilliant/utils/shortcutUtils';
import { defaultLanguages } from '../../../Brilliant/cosntants/defaultLanguages';
import { getAllBlockType } from '../../../Brilliant/utils/getAllBlockType';
import insertEmptyBlock from '../../../Brilliant/modifiers/insertEmptyBlock';

export interface GlobalMarkdownPluginOptions {
  block?: boolean;
  link?: any;
  uploadURL?: string;
  indent?: number;
  myToggleInlineStyle?: any;
  myToggleBlockType?: any;
  editorRefs?: React.LegacyRef<Editor>;
  editorBoxRefs?: any;
  confirmMedia?: any;
}

export class FluentMarkdownPlugin {
  blockRenderMap: DraftBlockRenderMap;

  decorators: DraftDecorator[];

  private featureSelectionLocked = false;
  private featureSelectionLockTimer: number | undefined;

  myToggleInlineStyle: (type: string) => void;
  myToggleBlockType: (type: string) => void;
  editorRefs: React.LegacyRef<Editor>;
  confirmMedia: any;
  editorBoxRefs: any;

  constructor({
    block = true,
    indent = 2,
    myToggleInlineStyle,
    myToggleBlockType,
    editorRefs,
    editorBoxRefs,
    confirmMedia,
  }: GlobalMarkdownPluginOptions) {
    let blockRenderMap: DraftBlockRenderMap;
    this.blockRenderMap = blockRenderMap;
    this.myToggleInlineStyle = myToggleInlineStyle;
    this.myToggleBlockType = myToggleBlockType;
    this.editorRefs = editorRefs;
    this.confirmMedia = confirmMedia;
    this.editorBoxRefs = editorBoxRefs;
  }

  onTab = (
    e: KeyboardEvent,
    { getEditorState, setEditorState }: PluginFunctions
  ): void => {
    const editorState = getEditorState();
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const type = content.getBlockForKey(selection.getStartKey()).getType();
    if (type === 'unordered-list-item' || type === 'ordered-list-item') {
      setEditorState(RichUtils.onTab(e as any, editorState, 4));
      e.preventDefault();
      return;
    }
    const newContentState = Modifier.insertText(
      content,
      selection,
      '  ',
      editorState.getCurrentInlineStyle()
    );
    setEditorState(
      EditorState.push(editorState, newContentState, 'insert-fragment')
    );
    e.preventDefault();
  };

  handleBeforeInput = (
    character: string,
    editorState: EditorState,
    eventTimeStamp: number,
    { setEditorState }: PluginFunctions
  ): DraftHandleValue => {
        const IntelligentTypeObj = {
      '"': '"',
      '[': ']',
      '{': '}',
      "'": "'",
      '(': ')',
    };
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const key = selection.getStartKey();
    const currentBlock = contentState.getBlockForKey(key);
    const type = currentBlock.getType();
    let newEditorState = editorState;
    if (type === 'code-block' && IntelligentTypeObj[character]) {
                  newEditorState = EditorState.push(
        editorState,
        Modifier.insertText(
          contentState,
          selection,
          `${character}${IntelligentTypeObj[character]}`
        ),
        'insert-characters'
      );
            let newSelection = newEditorState.getSelection();
      newSelection = newSelection.merge({
        anchorOffset: newSelection.get('anchorOffset') - 1,
        focusOffset: newSelection.get('anchorOffset') - 1,
      });
      newEditorState = EditorState.acceptSelection(
        newEditorState,
        newSelection
      );
      setEditorState(newEditorState);
      return 'handled';
    }

    
    const text = editorState
      .getCurrentContent()
      .getBlockForKey(key)
      .getText();
    const position = selection.getAnchorOffset();
    const line = [
      text.slice(0, position),
      character,
      text.slice(position),
    ].join('');
            newEditorState = checkCharacterForState(editorState, line, setEditorState);
        if (editorState !== newEditorState) {
      setEditorState(newEditorState);
      return 'handled';
    }
    return 'not-handled';
  };

  keyBindingFn = (e: React.KeyboardEvent<{}>): string | null =>
    handleMyKeyBindingFn(e, getDefaultKeyBinding);
  handleKeyCommand = (
    command: string,
    editorState: EditorState,
    eventTimeStamp: number,
    { setEditorState }: PluginFunctions
  ): DraftHandleValue => {
    const focus = () => {
      const { current } = this.editorRefs as any;
      current.focus();
    };
    const props: IhandleMyKeyCommand = {
      command,
      editorState,
      myToggleInlineStyle: this.myToggleInlineStyle,
      myToggleBlockType: this.myToggleBlockType,
      focus,
      setEditorState,
    };

    return handleMyKeyCommand(props);
  };

  handleReturn = (
    e: SyntheticKeyboardEvent,
    editorState: EditorState,
    { setEditorState }: PluginFunctions
  ) => {
    const config = { insertEmptyBlockOnReturnWithModifierKey: true };

    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selectionState.getStartKey());
    const textAlign = block.getData().get('text-align');
    if (textAlign) {
      const types = getAllBlockType(undefined, undefined, undefined, textAlign);
      let newEditorState = insertEmptyBlock(editorState);
      newEditorState = setBlockData(newEditorState, types);
      setEditorState(newEditorState);
      return 'handled';
    }

    let newEditorState = checkReturnForState(editorState, e, config);
    if (editorState !== newEditorState) {
      setEditorState(newEditorState);
      return 'handled';
    }
    return 'not-handled';
  };

  blockRendererFn = (
    block: ContentBlock,
    { setEditorState, getEditorState, getProps }: PluginFunctions
  ) => {
    const editorState = getEditorState();
    const type = block.getType();

    const { readOnly } = getProps();

    if (block.getText().indexOf('📷') != -1) {
      const contentState = editorState.getCurrentContent();
      const entity = block.getEntityAt(0);
      if (!entity) return null;
      const atomicType = contentState.getEntity(entity).getType();
      if (atomicType === 'IMAGE' || atomicType === 'image') {
        return {
          component: MediaBox,
          editable: false,
          props: {
            editorBoxRefs: this.editorBoxRefs,
            editorRefs: this.editorRefs,
            entityKey: entity,
          },
        };
      }
      return null;
    }
    switch (type) {
      case 'code-block': {
        return {
          component: CodeBlock,
          props: {
            setEditorState,
            renderLanguageSelect: CodeLanguageSelect,
            languages: defaultLanguages,
            language: block.getData().get('language'),
            getEditorState: editorState,
            readOnly: readOnly,
          },
        };
      }
      case 'info-block': {
        return {
          component: InfoBlock,
          props: {
            setEditorState,
            infotype: block.getData().get('infotype'),
            getEditorState: () => editorState,
          },
        };
      }

      case 'divider': {
        return {
          component: DividerLine,
          props: {
            setEditorState,
          },
        };
      }
      case 'atomic': {
        const contentState = editorState.getCurrentContent();
        const entity = block.getEntityAt(0);
        if (!entity) return null;
        const atomicType = contentState.getEntity(entity).getType();
        if (atomicType === 'IMAGE' || atomicType === 'image') {
          return {
            component: MediaBox,
            editable: false,
            props: {
              readOnly,
              editorBoxRefs: this.editorBoxRefs,
              editorRefs: this.editorRefs,
              entityKey: entity,
              setEditorState,
              getEditorState,
            },
          };
        }
        return null;
      }
      default:
        return null;
    }
  };
}

export function createGlobalMarkdownPlugin(
  options: GlobalMarkdownPluginOptions = {}
): FluentMarkdownPlugin {
  return new FluentMarkdownPlugin(options);
}
