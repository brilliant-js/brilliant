import React, { FC, useState, useMemo, ReactDOM } from 'react';
import { EditorState, EditorBlock, Modifier } from 'draft-js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ToastContainer, toast } from 'react-toastify';
import RichIcon from '../RichIcon/RichIcon';
import Styles from './code.module.scss';
import 'react-toastify/dist/ReactToastify.css';

const alias = {
  javascript: 'js',
  jsx: 'js',
};

interface SwitchContainerProps {
  onClickOutside?: () => void;
  onClick?: (event: any) => void;
  children: ReactDOM;
}

const SwitchContainer: FC<SwitchContainerProps> = props => {
  const { onClick, onClickOutside, children } = props;
  const handleClickOutside = () => {
    onClickOutside();
  };
  return (
    <div contentEditable={false} onClick={onClick}>
      {children}
    </div>
  );
};

export interface CodeProps {
  block: { getKey: () => any };
  blockProps: {
    setEditorState: any;
    renderLanguageSelect: any;
    languages: any;
    language: any;
    getEditorState: EditorState;
    readOnly: boolean;
  };
}

const CodeBlock: FC<CodeProps> = props => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const { blockProps, block } = props;
  const {
    getEditorState,
    setEditorState,
    readOnly,
    languages,
    renderLanguageSelect,
  } = blockProps;

  let { language } = blockProps;
  language = alias[language] || language;
  const selectedLabel = languages[language];
  const selectedValue = language;

  const copyValue = useMemo(() => (block as any).getText(), [block]);

  const options = Object.keys(languages).reduce(
    (acc, val) => [
      ...acc,
      {
        label: languages[val],
        value: val,
      },
    ],
    []
  );

  const onChange = (ev): void => {
    ev.preventDefault();
    ev.stopPropagation();
    setIsOpen(false);

    const blockKey = block.getKey();
    const editorState = getEditorState;
    const selection = editorState.getSelection();
    const language = ev.currentTarget.value;
    const blockSelection = selection.merge({
      anchorKey: blockKey,
      focusKey: blockKey,
    });

    let currentContent = editorState.getCurrentContent();
    currentContent = Modifier.mergeBlockData(currentContent, blockSelection, {
      language,
    } as any);

    const newEditorState = EditorState.push(
      editorState,
      currentContent,
      'change-block-data'
    );

    setEditorState(newEditorState);
  };

  const onSelectClick = (ev): void => {
    setIsOpen(true);
    ev.stopPropagation();
  };

  const onClickOutside = (): void => {
    if (isOpen === false) return;
    setIsOpen(false);
    const { getEditorState, setEditorState } = blockProps;

    const editorState = getEditorState;
    const selection = editorState.getSelection();

    setEditorState(EditorState.forceSelection(editorState, selection));
  };

  const handleCopyCode = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    const plainText = (block as any).getText();
    const oDiv = document.createElement('div');
    oDiv.innerText = plainText;
    document.body.appendChild(oDiv);
    const range = document.createRange();
    window.getSelection().removeAllRanges();
    range.selectNode(oDiv);
    oDiv.style.position = 'absolute';
    oDiv.style.top = '9999';
    window.getSelection().addRange(range);
    document.execCommand('Copy');
    oDiv.remove();
  };

  const handleMouseDown = (): void => {
    toast('✅复制成功!', {
      position: 'top-center',
      autoClose: 700,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setIsDown(true);
  };

  return (
    <pre className="language-xxx">
      <EditorBlock {...props} />

      <CopyToClipboard
        contentEditable={false}
        text={copyValue}
        onCopy={() => setIsCopied(true)}
      >
        <div
          contentEditable={false}
          className={Styles.copy}
          onMouseDown={handleMouseDown}
          onMouseUp={() => {
            setIsDown(false);
          }}
        >
          <RichIcon
            type="icon-fuzhi"
            contentEditable={false}
            className={`${Styles.copyBtn} ${isDown ? Styles.btnDown : ''}`}
          ></RichIcon>
        </div>
      </CopyToClipboard>

      <ToastContainer className={Styles.toast} />

      {!readOnly && (
        <SwitchContainer
          onClickOutside={onClickOutside}
          onClick={onSelectClick}
        >
          {renderLanguageSelect({
            selectedLabel,
            selectedValue,
            onChange,
            options,
          })}
        </SwitchContainer>
      )}
    </pre>
  );
};

export default CodeBlock;
