import React from 'react';

const wrapperTip = (content: string, keyTip?: string) => (
  <div style={{ textAlign: 'center', fontSize: 8 }}>
    <div>{content}</div>
    {keyTip && <div>{keyTip}</div>}
  </div>
);

const BLOCK_STYLES = [
  {
    label: 'UNSTYLED',
    style: 'unstyled',
    icon: 'icon-text',
    tipInfo: lang => wrapperTip(lang.controls.UNSTYLED, 'Ctrl+0'),
  },
  {
    label: 'H1',
    style: 'header-one',
    icon: 'icon-h-1',
    tipInfo: lang => wrapperTip(lang.controls.H1, 'Ctrl+0'),
  },
  {
    label: 'H2',
    style: 'header-two',
    icon: 'icon-h-2',
    tipInfo: lang => wrapperTip(lang.controls.H2, 'Ctrl+0'),
  },
  {
    label: 'H3',
    style: 'header-three',
    icon: 'icon-h-3',
    tipInfo: lang => wrapperTip(lang.controls.H3, 'Ctrl+0'),
  },
  {
    label: 'H4',
    style: 'header-four',
    icon: 'icon-h-4',
    tipInfo: lang => wrapperTip(lang.controls.H4, 'Ctrl+0'),
  },
  {
    label: 'H5',
    style: 'header-five',
    icon: 'icon-h-5',
    tipInfo: lang => wrapperTip(lang.controls.H5, 'Ctrl+0'),
  },
  {
    label: 'H6',
    style: 'header-six',
    icon: 'icon-h-6',
    tipInfo: lang => wrapperTip(lang.controls.H6, 'Ctrl+0'),
  },
  {
    label: 'Blockquote',
    style: 'blockquote',
    icon: 'icon-double-quotes-l',
    tipInfo: lang => wrapperTip(lang.controls.Blockquote, 'Ctrl+0'),
  },
  {
    label: 'UL',
    style: 'unordered-list-item',
    icon: 'icon-list-unordered',
    tipInfo: lang => wrapperTip(lang.controls.UL, 'Ctrl+0'),
  },
  {
    label: 'OL',
    style: 'ordered-list-item',
    icon: 'icon-list-ordered',
    tipInfo: lang => wrapperTip(lang.controls.OL, 'Ctrl+0'),
  },
  {
    label: 'Code Block',
    style: 'code-block',
    icon: 'icon-code-block1',
    tipInfo: lang => wrapperTip(lang.controls.CodeBlock, 'Ctrl+0'),
  },
  {
    label: 'LEFT',
    style: 'left',
    icon: 'icon-zuoduiqi',
    tipInfo: lang => wrapperTip(lang.controls.LEFT, 'Ctrl+0'),
  },
  {
    label: 'CENTER',
    style: 'center',
    icon: 'icon-zhongduiqi',
    tipInfo: lang => wrapperTip(lang.controls.CENTER, 'Ctrl+0'),
  },
  {
    label: 'RIGHT',
    style: 'right',
    icon: 'icon-youduiqi',
    tipInfo: lang => wrapperTip(lang.controls.RIGHT, 'Ctrl+0'),
  },
];

const EventStyleMap = {
  SAVE: { EVENT: 'myeditor-save', TYPE: 'header-one' },
  UNSTYLED: { EVENT: 'myeditor-unstyled', TYPE: 'unstyled' },
  H1: { EVENT: 'myeditor-h1', TYPE: 'header-one' },
  H2: { EVENT: 'myeditor-h2', TYPE: 'header-two' },
  H3: { EVENT: 'myeditor-h3', TYPE: 'header-three' },
  H4: { EVENT: 'myeditor-h4', TYPE: 'header-four' },
  H5: { EVENT: 'myeditor-h5', TYPE: 'header-five' },
  H6: { EVENT: 'myeditor-h6', TYPE: 'header-six' },
  UNORDER_LIST: { EVENT: 'myeditor-unorder-list', TYPE: 'unordered-list-item' },
  ORDER_LIST: { EVENT: 'myeditor-ordered-list', TYPE: 'ordered-list-item' },
  FOCUS: { EVENT: 'myeditor-focus', TYPE: 'myeditor-focus' },
  CODE: { EVENT: 'myeditor-inline-code', TYPE: 'CODE' },
  CODEBLOCK: { EVENT: 'myeditor-block-code', TYPE: 'code-block' },
  BLOCKQUOTE: { EVENT: 'myeditor-quote', TYPE: 'blockquote' },
  HIGHLIGHT: { EVENT: 'myeditor-highlight', TYPE: 'bgcolor-rgb(247, 145, 48)' },
  FORMATBRUSH: { EVENT: 'myeditor-format-brush', TYPE: 'FORMATBRUSH' },
  CLEARSTYLE: { EVENT: 'myeditor-clearstyle', TYPE: 'CLEARSTYLE' },
  STRIKETHROUGH: {
    EVENT: 'myeditor-inline-strikethrough',
    TYPE: 'STRIKETHROUGH',
  },
  TOLEFT: { EVENT: 'myeditor-to-left', TYPE: 'left' },
  TOCENTER: { EVENT: 'myeditor-to-center', TYPE: 'center' },
  TORIGHT: { EVENT: 'myeditor-to-right', TYPE: 'right' },
};

const INLINE_STYLES = [
  {
    label: 'Clear',
    style: EventStyleMap.CLEARSTYLE.TYPE,
    icon: 'icon-xiangpicha',
    tipInfo: lang => wrapperTip(lang.controls.Clear, 'Ctrl+0'),
  },
  {
    label: 'Bold',
    style: 'BOLD',
    icon: 'icon-bold',
    tipInfo: lang => wrapperTip(lang.controls.Bold, 'Ctrl+0'),
  },
  {
    label: 'Italic',
    style: 'ITALIC',
    icon: 'icon-italic',
    tipInfo: lang => wrapperTip(lang.controls.Italic, 'Ctrl+0'),
  },
  {
    label: 'Underline',
    style: 'UNDERLINE',
    icon: 'icon-underline',
    tipInfo: lang => wrapperTip(lang.controls.Underline, 'Ctrl+0'),
  },
  {
    label: 'StrikeThrough',
    style: 'STRIKETHROUGH',
    icon: 'icon-shanchuxian',
    tipInfo: lang => wrapperTip(lang.controls.StrikeThrough, 'Ctrl+0'),
  },
  {
    label: 'HighLight',
    style: EventStyleMap.HIGHLIGHT.TYPE,
    icon: 'icon-gaoliang',
    tipInfo: lang => wrapperTip(lang.controls.HighLight, 'Ctrl+0'),
  },
  {
    label: 'Code',
    style: 'CODE',
    icon: 'icon-code-view',
    tipInfo: lang => wrapperTip(lang.controls.Code, 'Ctrl+0'),
  },
];

const MULTIMEDIA_STYLES = [
  {
    label: '上传图片',
    style: 'upload-pic',
    icon: 'icon-thum',
    tipInfo: lang => wrapperTip(lang.controls.UploadPictures, 'Ctrl+0'),
  },
  {
    label: '设置链接',
    style: 'set-link',
    icon: 'icon-code-view',
    tipInfo: lang => wrapperTip(lang.controls.SettingLink, 'Ctrl+0'),
  },
  {
    label: 'Emoji',
    style: 'set-emoji',
    icon: 'icon-code-view',
    tipInfo: lang => wrapperTip(lang.controls.Emoji, 'Ctrl+0'),
  },
];

const COLORS = [
  { label: 'Red', style: 'red', tipInfo: wrapperTip('颜色') },
  { label: 'Orange', style: 'orange', tipInfo: wrapperTip('颜色') },
  { label: 'Yellow', style: 'yellow', tipInfo: wrapperTip('颜色') },
  { label: 'Green', style: 'green', tipInfo: wrapperTip('颜色') },
  { label: 'Blue', style: 'blue', tipInfo: wrapperTip('颜色') },
  { label: 'Indigo', style: 'indigo', tipInfo: wrapperTip('颜色') },
  { label: 'Violet', style: 'violet', tipInfo: wrapperTip('颜色') },
];

const colorStyleMap = {
  red: {
    color: 'rgba(255, 0, 0, 1.0)',
  },
  orange: {
    color: 'rgba(255, 127, 0, 1.0)',
  },
  yellow: {
    color: 'rgba(180, 180, 0, 1.0)',
  },
  green: {
    color: 'rgba(0, 180, 0, 1.0)',
  },
  blue: {
    color: 'rgba(0, 0, 255, 1.0)',
  },
  indigo: {
    color: 'rgba(75, 0, 130, 1.0)',
  },
  violet: {
    color: 'rgba(127, 0, 255, 1.0)',
  },
  CODE: {
    padding: '0.2em 0.4em',
    fontSize: '85%',
    color: '#EB5757',
    backgroundColor: 'rgba(208, 187, 193, 0.2)',
    borderRadius: '4px',
    lineHeight: 'normal',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
  },
  'bgcolor-rgb(247, 145, 48)': {
    backgroundColor: 'rgb(247, 145, 48)',
  },
};

const BlockStyleMap = {};
BLOCK_STYLES.map(block => {
  BlockStyleMap[block.style] = block.style;
});

const InlineStyleMap = {};
INLINE_STYLES.map(block => {
  InlineStyleMap[block.style] = block.style;
});

export type SyntheticKeyboardEvent = React.KeyboardEvent<{}>;

export {
  BLOCK_STYLES,
  INLINE_STYLES,
  COLORS,
  colorStyleMap,
  EventStyleMap,
  BlockStyleMap,
  InlineStyleMap,
  MULTIMEDIA_STYLES,
};
