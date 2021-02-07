import React, {
  FC,
  useState,
  useRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import {
  EditorState,
  RichUtils,
  ContentBlock,
  Modifier,
  DraftHandleValue,
  convertToRaw,
  AtomicBlockUtils,
  ContentState,
} from 'draft-js';

import {
  getSelectedBlocksMetadata,
  setBlockData,
  getEntityRange,
  getSelectionEntity,
} from 'draftjs-utils';

import Editor from 'draft-js-plugins-editor/lib';
import languages from '../languages';
import Prism from 'prismjs/prism';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-python';

import {
  colorStyleMap,
  EventStyleMap,
  SyntheticKeyboardEvent,
} from '../cosntants/typeMaps';
import { Controls } from '../components/Controls/Controls';
import InlineControls from '../components/Controls/InlineControls';
import createPrismPlugin from 'draft-js-prism-plugin';
import addLinkPlugin from '../components/LinkControls/addLinkPlugin';
import LinkEditComp from '../components/LinkControls/LinkEditComp';
import { isCursorBetweenLink } from '../utils/isCursorBetweenLink';
import {
  checkReturnForState,
  checkCharacterForState,
  replaceText,
  handleCodePasting,
  getContentSelectionAmbient,
} from '../utils/shortcutUtils';

import insertEmptyBlock from '../modifiers/insertEmptyBlock';
import createGlobalMarkdownPlugin from '../plugins/globalMarkdown';
import draftToHtml from '../exports/draftToHtml/draftToHtml';
import htmlToDraft from '../exports/htmlToDraft/htmlToDraft';
import { getAllBlockType } from '../utils/getAllBlockType';
import draftToMarkdown from '../exports/draftToMarkdown/draftToMarkdown';

import useBrilliantController from '../../store/useBrilliantController';
import { BrilliantProps, BetweenLink } from '../types/brilliant';

import Styles from '../styles/brilliant.module.scss';
import '../styles/customerDraft.css';
import '../../asset/prism-themes/prism-shades-of-purple.css';
import { getSelectionText } from '../utils/getSelectionText';

import '../../asset/iconfont';

const prismPlugin = createPrismPlugin({
  prism: Prism,
});

const BrilliantEditor: FC<BrilliantProps> = ({
  value,
  editorRef,
  imgControls = true,
  handleImgUpload,
  onEditorChange,
  readOnly,
  style = { minHeight: '50vh' },
  excludeFixedControls = [],
  excludeFloatControls = [],
  disableFloatControls = false,
  disableFixedControls = false,
  language = 'zh',
}) => {
  const config = { insertEmptyBlockOnReturnWithModifierKey: true };
  const [editorState, setEditorState] = useState<EditorState>(
    value ? value : EditorState.createEmpty()
  );
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [isCursorLink, setIsCursorLink] = useState<BetweenLink>(null);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(
    readOnly ? readOnly : false
  );

  const [state, controller] = useBrilliantController();
  const editorRefs = useRef(null);
  const editorBoxRefs = useRef(null);

  const handleMouseUp = e => {
    if (
      e.clientY > window.innerWidth ||
      e.clientY < 0 ||
      e.clientX < 0 ||
      e.clientX > window.innerHeight
    ) {
      setIsSelected(true)

    }
  };

  
  useEffect(() => {
    controller.setCurrentKey(editorState.getSelection().getStartKey());
    if (onEditorChange) {
      onEditorChange(editorState);
    }
    const isCursor = isCursorBetweenLink(editorState);
    setIsCursorLink(isCursor);
    if (isCursor) {
      const { selectedText } = getContentSelectionAmbient(editorState);
      if (selectedText) setIsSelected(false);
    } else {
      const selection = editorState.getSelection();
      const { selectedText } = getContentSelectionAmbient(editorState);
      if (selectedText) setIsSelected(false);
                                                if (
        !selection.isCollapsed() &&
        selectedText &&
        !/^\s+$/.test(selectedText)
      ) {
        setIsSelected(true);
      } else {
        setIsSelected(false);
      }
    }
    const { selectedText } = getContentSelectionAmbient(editorState);
        if (/^\s+$/.test(selectedText)) setIsSelected(false);
    document.addEventListener('mouseup', handleMouseUp, true);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, [editorState]);

  useImperativeHandle(editorRef, () => {
    const content = editorState.getCurrentContent();
    return {
      getMarkdownValue: () => draftToMarkdown(convertToRaw(content)),
      getHtmlValue: () => draftToHtml(convertToRaw(content)),
      getRawValue: () => convertToRaw(content),
    };
  });

  const focus = (): void => {
    const { current } = editorRefs;
    current.focus();
  };

  const onChange = async (newEditorState: EditorState, callback?: Function) => {
    await setEditorState(newEditorState);
    if (callback) await callback();
  };

  const handlePastedText = (
    text: string,
    html: string,
    editorState: EditorState
  ): DraftHandleValue => {
    let nextEditorState = handleCodePasting(editorState, text);

    if (nextEditorState && nextEditorState !== editorState) {
      setEditorState(nextEditorState);
      return 'handled';
    }

    if (html) {
      return 'not-handled';
    }

    if (!text) {
      return 'not-handled';
    }

    let newEditorState = editorState;
    let buffer = [];

    for (let y = 0; y < text.length; y += 1) {
      if (text[y].match(/[^A-z0-9_*~`]/)) {
        newEditorState = replaceText(newEditorState, buffer.join('') + text[y]);
        newEditorState = checkCharacterForState(newEditorState, text[y]);
        buffer = [];
      } else if (text[y].charCodeAt(0) === 10) {
        newEditorState = replaceText(newEditorState, buffer.join(''));
        const tmpEditorState = checkReturnForState(newEditorState, {}, config);
        if (newEditorState === tmpEditorState) {
          newEditorState = insertEmptyBlock(tmpEditorState);
        } else {
          newEditorState = tmpEditorState;
        }
        buffer = [];
      } else if (y === text.length - 1) {
        newEditorState = replaceText(newEditorState, buffer.join('') + text[y]);
        buffer = [];
      } else {
        buffer.push(text[y]);
      }
    }

    if (editorState !== newEditorState) {
      setEditorState(newEditorState);
      return 'handled';
    }

    return 'not-handled';
  };

  const myToggleBlockType = (blockType: string): void => {
    if (['left', 'center', 'right'].includes(blockType)) {
      const textAlign = blockType;
      const selectedBlocksMetadata = getSelectedBlocksMetadata(editorState);
      let newEditorState = null;

      if (selectedBlocksMetadata.get('text-align') !== textAlign) {
        const types = getAllBlockType(
          selectedBlocksMetadata.get('text-indent'),
          selectedBlocksMetadata.get('line-height'),
          selectedBlocksMetadata.get('letter-spacing'),
          textAlign
        );
        newEditorState = setBlockData(editorState, types);
      } else {
        const types = getAllBlockType(
          selectedBlocksMetadata.get('text-indent'),
          selectedBlocksMetadata.get('line-height'),
          selectedBlocksMetadata.get('letter-spacing'),
          undefined
        );
        newEditorState = setBlockData(editorState, types);
      }

      return setEditorState(newEditorState);
    } else if (blockType === 'code-block') {
      const getText = getSelectionText(editorState);
      const currentContent = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      let newEditorState = EditorState.push(
        editorState,
        Modifier.replaceText(currentContent, selection, getText),
        'insert-characters'
      );
      return setEditorState(
        RichUtils.toggleBlockType(newEditorState, blockType)
      );
    }
    return setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const myToggleInlineStyle = (inlineStyle: string): void => {
    if (inlineStyle === EventStyleMap.FORMATBRUSH.TYPE) {
    }

    if (inlineStyle === EventStyleMap.CLEARSTYLE.TYPE) {
      let contentState = editorState.getCurrentContent();

      const inlineArray = [
        'BOLD',
        'ITALIC',
        'UNDERLINE',
        'STRIKETHROUGH',
        'CODE',
        'bgcolor-rgb(247, 145, 48)',
      ];
      inlineArray.forEach((style: string) => {
        contentState = Modifier.removeInlineStyle(
          contentState,
          editorState.getSelection(),
          style
        );
      });

      return setEditorState(
        EditorState.push(editorState, contentState, 'change-inline-style')
      );
    }

    return setEditorState(
      RichUtils.toggleInlineStyle(editorState, inlineStyle)
    );
  };

  const getBlockStyle = (contentBlock: ContentBlock): string => {
    const type = contentBlock.getType();

    if (type === EventStyleMap.BLOCKQUOTE.TYPE) {
      return Styles['RichEditor-blockquote'];
    }
    if (type === 'code-block') {
      return Styles.code;
    }

    const metaData = contentBlock.getData();
    const textIndent = metaData.get('text-indent');
    const lineHeight = metaData.get('line-height');
    const letterSpacing = metaData.get('letter-spacing');
    const textAlign = metaData.get('text-align');

    if (textAlign) {
      return Styles[`block-align-${textAlign}`];
    }
  };

  const confirmMedia = (src: string): void => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'IMAGE',
      'MUTABLE',
      { src }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    onChange(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
    );
  };

  const handlePastedFiles = (fileList: Blob[]): DraftHandleValue => {
    if (!imgControls) return 'not-handled';

    fileList.forEach(item => {
      if (handleImgUpload) {
        controller.fileUpload(item, handleImgUpload).then(res => {
          confirmMedia(res.url);
        });
      } else {
        controller.fileToBase64(item).then(res => {
          confirmMedia(res as string);
        });
      }
    });
    return 'handled';
  };

  const handleReturn = (
    e: SyntheticKeyboardEvent,
    oldEditorState: EditorState
  ): DraftHandleValue => {
    const selectionState = oldEditorState.getSelection();
    const offset = selectionState.getFocusOffset();
    const contentState = oldEditorState.getCurrentContent();
    const block = contentState.getBlockForKey(selectionState.getStartKey());
    const textAlign = block.getData().get('text-align');

    if (textAlign) {
      const types = getAllBlockType(undefined, undefined, undefined, textAlign);
      let newEditorState = EditorState.push(
        oldEditorState,
        Modifier.splitBlock(contentState, selectionState),
        'split-block'
      );
      newEditorState = setBlockData(newEditorState, types);
      onChange(newEditorState);
      return 'handled';
    }

    return 'not-handled';
  };

  const confirmLink = (title: string, src: string): void => {
    let selection = editorState.getSelection();
    const currentEntity = editorState
      ? getSelectionEntity(editorState)
      : undefined;

    if (currentEntity) {
      const entityRange = getEntityRange(editorState, currentEntity);
      const isBackward = selection.getIsBackward();
      if (isBackward) {
        selection = selection.merge({
          anchorOffset: entityRange.end,
          focusOffset: entityRange.start,
        });
      } else {
        selection = selection.merge({
          anchorOffset: entityRange.start,
          focusOffset: entityRange.end,
        });
      }
    }

    const newSrc = src.indexOf('http') < 0 ? `https://${src}` : src;
    const entityKey = editorState
      .getCurrentContent()
      .createEntity('LINK', 'MUTABLE', { url: newSrc })
      .getLastCreatedEntityKey();

    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      selection,
      `${title}`,
      editorState.getCurrentInlineStyle(),
      entityKey
    );
    let newEditorState = EditorState.push(
      editorState,
      contentState,
      'insert-characters'
    );

    selection = newEditorState.getSelection().merge({
      anchorOffset: selection.get('anchorOffset') + title.length,
      focusOffset: selection.get('anchorOffset') + title.length,
    });
    newEditorState = EditorState.acceptSelection(newEditorState, selection);

    onChange(
      EditorState.push(newEditorState, contentState, 'insert-characters'),
      focus
    );
  };

  const editLinkAfterSelection = (entityKey: string, src: string): void => {
    const contentState: ContentState = editorState.getCurrentContent();
    const newSrc = src.indexOf('http') < 0 ? `https://${src}` : src;
    contentState.mergeEntityData(entityKey, { url: newSrc });
    window.setTimeout(() => {
      setIsCursorLink(isCursorBetweenLink(editorState));
      focus();
    }, 0);
  };

  const removeLink = (): void => {
    let selection = editorState.getSelection();
    const currentEntity = editorState
      ? getSelectionEntity(editorState)
      : undefined;

    if (currentEntity) {
      const entityRange = getEntityRange(editorState, currentEntity);
      const isBackward = selection.getIsBackward();

      if (isBackward) {
        selection = selection.merge({
          anchorOffset: entityRange.end,
          focusOffset: entityRange.start,
        });
      } else {
        selection = selection.merge({
          anchorOffset: entityRange.start,
          focusOffset: entityRange.end,
        });
      }

      onChange(RichUtils.toggleLink(editorState, selection, null), focus);
    }
  };

  const confirmEmoji = (emojiIcon: string, callback: Function): void => {
    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      emojiIcon,
      editorState.getCurrentInlineStyle()
    );

    const newCallback = () => {
      focus();
      callback();
    };

    onChange(
      EditorState.push(editorState, contentState, 'insert-characters'),
      newCallback
    );
  };

  const geneExcludeItemMap = useCallback(
    (excludeItemList: Array<string>): Object => {
      const obj = {};
      excludeItemList.forEach((item, index) => {
        obj[item] = item;
      });
      return obj;
    },
    []
  );

  const excludeFixedItemMap = useMemo(
    () => geneExcludeItemMap(excludeFixedControls),
    [excludeFixedControls]
  );
  const excludeFloatItemMap = useMemo(
    () => geneExcludeItemMap(excludeFloatControls),
    [excludeFloatControls]
  );

  const controlProps = {
    myToggleInlineStyle,
    myToggleBlockType,
    editorState,
    confirmMedia,
    confirmLink,
    confirmEmoji,
    focus,
    imgControls,
    handleImgUpload,
    language: languages[language],
  };

  return (
    <>
      <div style={style} className={Styles['RichEditor-root']}>
        {!isReadOnly && !disableFixedControls && (
          <div className={Styles.BtnBox}>
            <Controls {...controlProps} excludeItemMap={excludeFixedItemMap} />
          </div>
        )}

        {isSelected && !disableFloatControls && (
          <InlineControls
            {...isCursorLink}
            editorState={editorState}
            editLinkAfterSelection={editLinkAfterSelection}
            removeLink={removeLink}
          >
            <Controls {...controlProps} excludeItemMap={excludeFloatItemMap} />
          </InlineControls>
        )}

        {isCursorLink && (
          <LinkEditComp
            {...isCursorLink}
            editorState={editorState}
            editLinkAfterSelection={editLinkAfterSelection}
            removeLink={removeLink}
          />
        )}

        <div
          className={Styles['RichEditor-editor']}
          ref={editorBoxRefs}
          onClick={() => setIsCursorLink(isCursorBetweenLink(editorState))}
        >
          <Editor
            editorState={editorState}
            readOnly={isReadOnly}
            onChange={setEditorState}
            customStyleMap={colorStyleMap}
            blockStyleFn={getBlockStyle}
            handlePastedText={handlePastedText}
            handlePastedFiles={handlePastedFiles}
            handleReturn={handleReturn}
            ref={editorRefs}
            plugins={[
              prismPlugin,
              addLinkPlugin,
              createGlobalMarkdownPlugin({
                myToggleInlineStyle,
                myToggleBlockType,
                editorRefs,
                confirmMedia,
                editorBoxRefs,
              }),
            ]}
            tabIndex={4}
          />
        </div>
      </div>
    </>
  );
};

export default BrilliantEditor;
