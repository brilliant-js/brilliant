import { List, OrderedSet, Map } from 'immutable';
import {
  ContentState,
  CharacterMetadata,
  ContentBlock,
  Entity,
  BlockMapBuilder,
  genKey,
  SelectionState,
  EditorState,
  convertToRaw,
} from 'draft-js';
import getSafeBodyFromHTML from './parseHTML';
import rangeSort from './rangeSort';

const NBSP = '&nbsp;';
const SPACE = ' ';

const MAX_DEPTH = 4;

const REGEX_CR = new RegExp('\r', 'g');
const REGEX_LF = new RegExp('\n', 'g');
const REGEX_NBSP = new RegExp(NBSP, 'g');
const REGEX_BLOCK_DELIMITER = new RegExp('\r', 'g');

const blockTags = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'blockquote',
  'pre',
  'atomic',
];
const inlineTags = {
  b: 'BOLD',
  code: 'CODE',
  del: 'STRIKETHROUGH',
  em: 'ITALIC',
  i: 'ITALIC',
  s: 'STRIKETHROUGH',
  strike: 'STRIKETHROUGH',
  strong: 'BOLD',
  u: 'UNDERLINE',
};

const handleMiddleware = (maybeMiddleware, base) => {
  if (maybeMiddleware && maybeMiddleware.__isMiddleware === true) {
    return maybeMiddleware(base);
  }

  return maybeMiddleware;
};

const defaultHTMLToBlock = (nodeName, node, lastList) => {
  if (nodeName === 'img') {
    return {
      type: 'atomic',
      text: node.alt,
      key: genKey(),
      depth: 0,
      data: { src: node.src },
    };
  }
  if (nodeName === 'pre') {
    const languageStr = node.outerHTML;
    if (languageStr.match(/style="language:(\S*?);/)) {
      const language = languageStr.match(/style="language:(\S*?);/)[1];
      return {
        type: 'code-block',
        data: { language },
      };
    }
  }
};

const defaultHTMLToStyle = (nodeName, node, currentStyle) => currentStyle;

const defaultHTMLToEntity = (nodeName, node, createEntity) => {
  if (nodeName === 'a') {
    return createEntity('LINK', 'MUTABLE', { url: node.href });
  }
  if (nodeName === 'img') {
    const image = createEntity('IMAGE', 'IMMUTABLE', {
      src: node.src,
      height: node.style.height,
      width: node.style.width,
      alignment: node.style.textAlign,
    });
    return image;
  }
};

const defaultTextToEntity = text => [];

const nullthrows = x => {
  if (x != null) {
    return x;
  }
  throw new Error('Got unexpected null or undefined');
};

const sanitizeDraftText = input => input.replace(REGEX_BLOCK_DELIMITER, '');

function getEmptyChunk() {
  return {
    text: '',
    inlines: [],
    entities: [],
    blocks: [],
  };
}

function getWhitespaceChunk(inEntity) {
  const entities = new Array(1);
  if (inEntity) {
    entities[0] = inEntity;
  }
  return {
    text: SPACE,
    inlines: [OrderedSet()],
    entities,
    blocks: [],
  };
}

function getSoftNewlineChunk(block, depth, flat = false, data = Map()) {
  if (flat === true) {
    return {
      text: '\r',
      inlines: [OrderedSet()],
      entities: new Array(1),
      blocks: [
        {
          type: block,
          data,
          depth: Math.max(0, Math.min(MAX_DEPTH, depth)),
        },
      ],
      isNewline: true,
    };
  }

  return {
    text: '\n',
    inlines: [OrderedSet()],
    entities: new Array(1),
    blocks: [],
  };
}

function getBlockDividerChunk(block, depth, data = Map()) {
  return {
    text: '\r',
    inlines: [OrderedSet()],
    entities: new Array(1),
    blocks: [
      {
        type: block,
        data,
        depth: Math.max(0, Math.min(MAX_DEPTH, depth)),
      },
    ],
  };
}

function getBlockTypeForTag(tag, lastList) {
  switch (tag) {
    case 'h1':
      return 'header-one';
    case 'h2':
      return 'header-two';
    case 'h3':
      return 'header-three';
    case 'h4':
      return 'header-four';
    case 'h5':
      return 'header-five';
    case 'h6':
      return 'header-six';
    case 'li':
      if (lastList === 'ol') {
        return 'ordered-list-item';
      }
      return 'unordered-list-item';
    case 'blockquote':
      return 'blockquote';
    case 'pre':
      return 'code-block';
    case 'div':
      return 'div';
    case 'p':
      return 'unstyled';
    default:
      return null;
  }
}

function baseCheckBlockType(nodeName, node, lastList) {
  return getBlockTypeForTag(nodeName, lastList);
}

function processInlineTag(tag, node, currentStyle) {
  const styleToCheck = inlineTags[tag];
  if (styleToCheck) {
    currentStyle = currentStyle.add(styleToCheck).toOrderedSet();
  } else if (node instanceof HTMLElement) {
    const htmlElement = node;
    currentStyle = currentStyle
      .withMutations(style => {
        if (htmlElement.style.fontWeight === 'bold') {
          style.add('BOLD');
        }

        if (htmlElement.style.fontStyle === 'italic') {
          style.add('ITALIC');
        }

        if (htmlElement.style.textDecoration === 'underline') {
          style.add('UNDERLINE');
        }

        if (htmlElement.style.textDecoration === 'line-through') {
          style.add('STRIKETHROUGH');
        }

        if (htmlElement.style.backgroundColor) {
          style.add(`bgcolor-${htmlElement.style.backgroundColor}`);
        }
      })
      .toOrderedSet();
  }
  return currentStyle;
}

function baseProcessInlineTag(tag, node, inlineStyles = OrderedSet()) {
  return processInlineTag(tag, node, inlineStyles);
}

function joinChunks(A, B, flat = false) {
  const firstInB = B.text.slice(0, 1);
  const lastInA = A.text.slice(-1);

  const adjacentDividers = lastInA === '\r' && firstInB === '\r';
  const isJoiningBlocks = A.text !== '\r' && B.text !== '\r';
  const addingNewlineToEmptyBlock =
    A.text === '\r' && !A.isNewline && B.isNewline;

  if (adjacentDividers && (isJoiningBlocks || addingNewlineToEmptyBlock)) {
    A.text = A.text.slice(0, -1);
    A.inlines.pop();
    A.entities.pop();
    A.blocks.pop();
  }

  if (A.text.slice(-1) === '\r' && flat === true) {
    if (B.text === SPACE || B.text === '\n') {
      return A;
    }
    if (firstInB === SPACE || firstInB === '\n') {
      B.text = B.text.slice(1);
      B.inlines.shift();
      B.entities.shift();
    }
  }

  const isNewline = A.text.length === 0 && B.isNewline;

  return {
    text: A.text + B.text,
    inlines: A.inlines.concat(B.inlines),
    entities: A.entities.concat(B.entities),
    blocks: A.blocks.concat(B.blocks),
    isNewline,
  };
}

function containsSemanticBlockMarkup(html) {
  return blockTags.some(tag => html.indexOf(`<${tag}`) !== -1);
}

function genFragment(
  node: { nodeName: string; textContent: any; firstChild: any },
  inlineStyle: OrderedSet<unknown>,
  lastList: string,
  inBlock: string,
  fragmentBlockTags: string | any[],
  depth: number,
  processCustomInlineStyles: (arg0: any, arg1: any, arg2: any) => any,
  checkEntityNode: (
    arg0: any,
    arg1: any,
    arg2: any,
    arg3: any,
    arg4: any,
    arg5: any
  ) => any,
  checkEntityText: any,
  checkBlockType: (arg0: any, arg1: any, arg2: any, arg3: any) => any,
  createEntity: any,
  getEntity: any,
  mergeEntityData: any,
  replaceEntityData: any,
  options: { flat: boolean },
  inEntity: string
) {
  let nodeName = node.nodeName.toLowerCase();
  let newBlock = false;
  let nextBlockType = 'unstyled';

  if (nodeName === '#text') {
    let text = node.textContent;
    if (text.trim() === '' && inBlock === null) {
      return getEmptyChunk();
    }

    if (text.trim() === '' && inBlock !== 'code-block') {
      return getWhitespaceChunk(inEntity);
    }
    if (inBlock !== 'code-block') {
      text = text.replace(REGEX_LF, SPACE);
    }

    const entities = Array(text.length).fill(inEntity);

    let offsetChange = 0;
    const textEntities = checkEntityText(
      text,
      createEntity,
      getEntity,
      mergeEntityData,
      replaceEntityData
    ).sort(rangeSort);

    textEntities.forEach(({ entity, offset, length, result }) => {
      const adjustedOffset = offset + offsetChange;

      if (result === null || result === undefined) {
        result = text.substr(adjustedOffset, length);
      }

      const textArray = text.split('');
      textArray.splice
        .bind(textArray, adjustedOffset, length)
        .apply(textArray, result.split(''));
      text = textArray.join('');

      entities.splice
        .bind(entities, adjustedOffset, length)
        .apply(entities, Array(result.length).fill(entity));
      offsetChange += result.length - length;
    });

    return {
      text,
      inlines: Array(text.length).fill(inlineStyle),
      entities,
      blocks: [],
    };
  }

  if (nodeName === 'br') {
    const blockType = inBlock;

    if (blockType === null) {
      return getSoftNewlineChunk('unstyled', depth, true);
    }

    return getSoftNewlineChunk(blockType || 'unstyled', depth, options.flat);
  }

  let chunk = getEmptyChunk();
  let newChunk = null;

  inlineStyle = processInlineTag(nodeName, node, inlineStyle);
  inlineStyle = processCustomInlineStyles(nodeName, node, inlineStyle);

  if (nodeName === 'ul' || nodeName === 'ol') {
    if (lastList) {
      depth += 1;
    }
    lastList = nodeName;
    inBlock = null;
  }

  let blockInfo = checkBlockType(nodeName, node, lastList, inBlock);
  let blockType;
  let blockDataMap;

  if (blockInfo === false) {
    return getEmptyChunk();
  }

  blockInfo = blockInfo || {};

  if (typeof blockInfo === 'string') {
    blockType = blockInfo;
    blockDataMap = Map();
  } else {
    blockType = typeof blockInfo === 'string' ? blockInfo : blockInfo.type;
    blockDataMap = blockInfo.data ? Map(blockInfo.data) : Map();
  }
  if (!inBlock && (fragmentBlockTags.indexOf(nodeName) !== -1 || blockType)) {
    if(getBlockTypeForTag(nodeName, lastList)==='div'){
    }
    else{
    chunk = getBlockDividerChunk(
      blockType || getBlockTypeForTag(nodeName, lastList),
      depth,
      blockDataMap
    );
    inBlock = blockType || getBlockTypeForTag(nodeName, lastList);
    newBlock = true;
    }
  } else if (
    lastList &&
    (inBlock === 'ordered-list-item' || inBlock === 'unordered-list-item') &&
    nodeName === 'li'
  ) {
    const listItemBlockType = getBlockTypeForTag(nodeName, lastList);
    chunk = getBlockDividerChunk(listItemBlockType, depth);
    inBlock = listItemBlockType;
    newBlock = true;
    nextBlockType =
      lastList === 'ul' ? 'unordered-list-item' : 'ordered-list-item';
  } else if (inBlock && inBlock !== 'atomic' && blockType === 'atomic') {
    inBlock = blockType;
    newBlock = true;
    chunk = getSoftNewlineChunk(blockType, depth, true, blockDataMap);
  }
  let child = node.firstChild;

  if (
    child == null &&
    inEntity &&
    (blockType === 'atomic' || inBlock === 'atomic')
  ) {
    child = document.createTextNode(' ');
  }

  if (child != null) {
    nodeName = child.nodeName.toLowerCase();
  }

  let entityId = null;

  while (child) {
    entityId = checkEntityNode(
      nodeName,
      child,
      createEntity,
      getEntity,
      mergeEntityData,
      replaceEntityData
    );

    newChunk = genFragment(
      child,
      inlineStyle,
      lastList,
      inBlock,
      fragmentBlockTags,
      depth,
      processCustomInlineStyles,
      checkEntityNode,
      checkEntityText,
      checkBlockType,
      createEntity,
      getEntity,
      mergeEntityData,
      replaceEntityData,
      options,
      entityId || inEntity
    );

    chunk = joinChunks(chunk, newChunk, options.flat);
    const sibling = child.nextSibling;

    if (sibling && fragmentBlockTags.indexOf(nodeName) >= 0 && inBlock) {
      let newBlockInfo = checkBlockType(nodeName, child, lastList, inBlock);

      let newBlockType;
      let newBlockData;

      if (newBlockInfo !== false) {
        newBlockInfo = newBlockInfo || {};

        if (typeof newBlockInfo === 'string') {
          newBlockType = newBlockInfo;
          newBlockData = Map();
        } else {
          newBlockType =
            newBlockInfo.type || getBlockTypeForTag(nodeName, lastList);
          newBlockData = newBlockInfo.data ? Map(newBlockInfo.data) : Map();
        }

        chunk = joinChunks(
          chunk,
          getSoftNewlineChunk(newBlockType, depth, options.flat, newBlockData),
          options.flat
        );
      }
    }
    if (sibling) {
      nodeName = sibling.nodeName.toLowerCase();
    }
    child = sibling;
  }

  if (newBlock) {
    chunk = joinChunks(
      chunk,
      getBlockDividerChunk(nextBlockType, depth, Map()),
      options.flat
    );
  }

  return chunk;
}

function getChunkForHTML(
  html: string,
  processCustomInlineStyles: (arg0: any, arg1: any, arg2: any) => any,
  checkEntityNode: (
    arg0: any,
    arg1: any,
    arg2: any,
    arg3: any,
    arg4: any,
    arg5: any
  ) => any,
  checkEntityText: (
    arg0: any,
    arg1: any,
    arg2: any,
    arg3: any,
    arg4: any
  ) => { offset: number; length: number }[],
  checkBlockType: (arg0: any, arg1: any, arg2: any, arg3: any) => any,
  createEntity: any,
  getEntity: any,
  mergeEntityData: any,
  replaceEntityData: any,
  options: { flat: boolean },
  DOMBuilder: (arg0: any) => any
) {
  html = html
    .trim()
    .replace(REGEX_CR, '')
    .replace(REGEX_NBSP, SPACE);

  const safeBody = DOMBuilder(html);
  if (!safeBody) {
    return null;
  }

  const workingBlocks = containsSemanticBlockMarkup(html)
    ? blockTags.concat(['div'])
    : ['div'];

  let chunk = genFragment(
    safeBody,
    OrderedSet(),
    'ul',
    null,
    workingBlocks,
    -1,
    processCustomInlineStyles,
    checkEntityNode,
    checkEntityText,
    checkBlockType,
    createEntity,
    getEntity,
    mergeEntityData,
    replaceEntityData,
    options,
    undefined
  );
  if (chunk.text.indexOf('\r') === 0) {
    chunk = {
      text: chunk.text.slice(1),
      inlines: chunk.inlines.slice(1),
      entities: chunk.entities.slice(1),
      blocks: chunk.blocks,
    };
  }

  if (chunk.text.slice(-1) === '\r') {
    chunk.text = chunk.text.slice(0, -1);
    chunk.inlines = chunk.inlines.slice(0, -1);
    chunk.entities = chunk.entities.slice(0, -1);
    chunk.blocks.pop();
  }

  if (chunk.blocks.length === 0) {
    chunk.blocks.push({ type: 'unstyled', data: Map(), depth: 0 });
  }

  if (chunk.text.split('\r').length === chunk.blocks.length + 1) {
    chunk.blocks.unshift({ type: 'unstyled', data: Map(), depth: 0 });
  }

  return chunk;
}

function convertFromHTMLtoContentBlocks(
  html,
  processCustomInlineStyles,
  checkEntityNode,
  checkEntityText,
  checkBlockType,
  createEntity,
  getEntity,
  mergeEntityData,
  replaceEntityData,
  options,
  DOMBuilder,
  generateKey
) {
  const chunk = getChunkForHTML(
    html,
    processCustomInlineStyles,
    checkEntityNode,
    checkEntityText,
    checkBlockType,
    createEntity,
    getEntity,
    mergeEntityData,
    replaceEntityData,
    options,
    DOMBuilder
  );

  if (chunk == null) {
    return [];
  }
  let start = 0;
  return chunk.text.split('\r').map((textBlock, blockIndex) => {
    textBlock = sanitizeDraftText(textBlock);
    const end = start + textBlock.length;
    const inlines = nullthrows(chunk).inlines.slice(start, end);
    const entities = nullthrows(chunk).entities.slice(start, end);
    const characterList = List(
      inlines.map((style, entityIndex) => {
        const data = { style, entity: null };
        if (entities[entityIndex]) {
          data.entity = entities[entityIndex];
        }
        return CharacterMetadata.create(data);
      })
    );
    start = end + 1;

    return new ContentBlock({
      key: generateKey(),
      type: nullthrows(chunk).blocks[blockIndex].type,
      data: nullthrows(chunk).blocks[blockIndex].data,
      depth: nullthrows(chunk).blocks[blockIndex].depth,
      text: textBlock,
      characterList,
    });
  });
}

const htmlToDraft = ({
  htmlToStyle = defaultHTMLToStyle,
  htmlToEntity = defaultHTMLToEntity,
  textToEntity = defaultTextToEntity,
  htmlToBlock = defaultHTMLToBlock,
}) => (
  html: any,
  options = {
    flat: false,
  },
  DOMBuilder = getSafeBodyFromHTML,
  generateKey = genKey
) => {
  let contentState = ContentState.createFromText('');
  const createEntityWithContentState = (
    type: string,
    mutability: any,
    data?: Object
  ) => {
    if (contentState.createEntity) {
      contentState = contentState.createEntity(type, mutability, data);
      return contentState.getLastCreatedEntityKey();
    }
    return Entity.create(type, mutability, data);
  };

  const getEntityWithContentState = (key: string) => {
    if (contentState.getEntity) {
      return contentState.getEntity(key);
    }
    return Entity.get(key);
  };

  const mergeEntityDataWithContentState = (
    key: string,
    toMerge: {
      [key: string]: any;
    }
  ) => {
    if (contentState.mergeEntityData) {
      contentState = contentState.mergeEntityData(key, toMerge);
      return;
    }
    Entity.mergeData(key, toMerge);
  };

  const replaceEntityDataWithContentState = (
    key: string,
    toMerge: {
      [key: string]: any;
    }
  ) => {
    if (contentState.replaceEntityData) {
      contentState = contentState.replaceEntityData(key, toMerge);
      return;
    }

    Entity.replaceData(key, toMerge);
  };

  const contentBlocks = convertFromHTMLtoContentBlocks(
    html,
    handleMiddleware(htmlToStyle, baseProcessInlineTag),
    handleMiddleware(htmlToEntity, defaultHTMLToEntity),
    handleMiddleware(textToEntity, defaultTextToEntity),
    handleMiddleware(htmlToBlock, baseCheckBlockType),
    createEntityWithContentState,
    getEntityWithContentState,
    mergeEntityDataWithContentState,
    replaceEntityDataWithContentState,
    options,
    DOMBuilder,
    generateKey
  );
  const blockMap = BlockMapBuilder.createFromArray(contentBlocks);

  const firstBlockKey = contentBlocks[0].getKey();

  return contentState.merge({
    blockMap,
    selectionBefore: SelectionState.createEmpty(firstBlockKey),
    selectionAfter: SelectionState.createEmpty(firstBlockKey),
  });
};
export const createFromHtml = (html: string) => {
  const content = htmlToDraft({})(html);
  return EditorState.createWithContent(content as any);
};
export default (html: string) => htmlToDraft({})(html);
