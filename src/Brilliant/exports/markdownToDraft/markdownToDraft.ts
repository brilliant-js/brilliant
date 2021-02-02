import { convertFromRaw, EditorState } from 'draft-js';
import { Remarkable } from 'remarkable';

const TRAILING_NEW_LINE = /\n$/;

function strlen(str: Iterable<unknown> | ArrayLike<unknown>) {
  return Array.from(str).length;
}

const DefaultBlockTypes = {
  paragraph_open() {
    return {
      type: 'unstyled',
      text: '',
      entityRanges: [],
      inlineStyleRanges: [],
    };
  },

  blockquote_open() {
    return {
      type: 'blockquote',
      text: '',
    };
  },

  ordered_list_item_open() {
    return {
      type: 'ordered-list-item',
      text: '',
    };
  },

  unordered_list_item_open() {
    return {
      type: 'unordered-list-item',
      text: '',
    };
  },

  fence(item: { params: any; content: any }) {
    return {
      type: 'code-block',
      data: {
        language: item.params || '',
      },
      text: (item.content || '').replace(TRAILING_NEW_LINE, ''),
      entityRanges: [],
      inlineStyleRanges: [],
    };
  },

  heading_open(item: { hLevel: number }) {
    const type = `header-${
      ({
        1: 'one',
        2: 'two',
        3: 'three',
        4: 'four',
        5: 'five',
        6: 'six',
      } as { [key: number]: string })[item.hLevel]
    }`;

    return {
      type,
      text: '',
    };
  },
};

const DefaultBlockEntities = {
  link_open(item: { href: any }) {
    return {
      type: 'LINK',
      mutability: 'MUTABLE',
      data: {
        url: item.href,
      },
    };
  },
  image(item: { src: any }) {
    return {
      type: 'IMAGE',
      mutability: 'IMMUTABLE',
      data: {
        src: item.src,
      },
    };
  },
};

const DefaultBlockStyles = {
  strong_open: 'BOLD',
  em_open: 'ITALIC',
  del_open: 'STRIKETHROUGH',
  code: 'CODE',
};

let idCounter = -1;
function generateUniqueKey() {
  idCounter += 1;
  return idCounter;
}

function parseInline(
  inlineItem: any,
  BlockEntities: { [x: string]: any },
  BlockStyles: { [x: string]: any }
) {
  let content = '';
  const blockEntities = {};
  const blockEntityRanges: any = [];
  let blockInlineStyleRanges: any[] = [];
  const key = generateUniqueKey();
  inlineItem.children.forEach(function(child: {
    type: string;
    content: Iterable<unknown> | ArrayLike<unknown>;
  }) {
    if (child.type === 'text') {
      content += child.content;
    } else if (child.type === 'softbreak') {
      content += '\n';
    } else if (child.type === 'hardbreak') {
      content += '\n';
    } else if (BlockStyles[child.type]) {
      const styleBlock = {
        offset: strlen(content) || 0,
        length: 0,
        style: BlockStyles[child.type],
      };

      if (child.type === 'code') {
        styleBlock.length = strlen(child.content);
        content += child.content;
      }

      blockInlineStyleRanges.push(styleBlock);
    } else if (BlockEntities[child.type]) {
      (blockEntities as any)[key] = BlockEntities[child.type](child);
      blockEntityRanges.push({
        offset: strlen(content) || 0,
        length: 1,
        key,
      });
    } else if (
      child.type.indexOf('_close') !== -1 &&
      BlockEntities[child.type.replace('_close', '_open')]
    ) {
      blockEntityRanges[blockEntityRanges.length - 1].length =
        strlen(content) -
        blockEntityRanges[blockEntityRanges.length - 1].offset;
    } else if (
      child.type.indexOf('_close') !== -1 &&
      BlockStyles[child.type.replace('_close', '_open')]
    ) {
      const type = BlockStyles[child.type.replace('_close', '_open')];
      blockInlineStyleRanges = blockInlineStyleRanges.map(style => {
        if (style.length === 0 && style.style === type) {
          style.length = strlen(content) - style.offset;
        }
        return style;
      });
    }
  });

  return { content, blockEntities, blockEntityRanges, blockInlineStyleRanges };
}

function markdownToDraft(string: any, options: any = {}) {
  const remarkablePreset =
    options.remarkablePreset || options.remarkableOptions;
  const remarkableOptions =
    typeof options.remarkableOptions === 'object'
      ? options.remarkableOptions
      : null;
  const md = new Remarkable(remarkablePreset, remarkableOptions);

  if (
    !remarkableOptions ||
    !remarkableOptions.enable ||
    !remarkableOptions.enable.block ||
    remarkableOptions.enable.block !== 'table' ||
    remarkableOptions.enable.block.includes('table') === false
  ) {
    md.block.ruler.disable('table');
  }

  if (remarkableOptions && remarkableOptions.disable) {
    for (const [key, value] of Object.entries(remarkableOptions.disable)) {
      (md as { [key: string]: any })[key].ruler.disable(value);
    }
  }

  if (remarkableOptions && remarkableOptions.enable) {
    for (const [key, value] of Object.entries(remarkableOptions.enable)) {
      (md as { [key: string]: any })[key].ruler.enable(value);
    }
  }

  if (options.remarkablePlugins) {
    options.remarkablePlugins.forEach(function(plugin: any) {
      md.use(plugin, {});
    });
  }

  const blocks: any[] = [];
  const entityMap = {};
  const parsedData = md.parse(string, {});

  let currentListType: string | null = null;
  let previousBlockEndingLine = 0;

  const BlockTypes = {
    ...DefaultBlockTypes,
    ...(options.blockTypes || {}),
  };
  const BlockEntities = {
    ...DefaultBlockEntities,
    ...(options.blockEntities || {}),
  };
  const BlockStyles = {
    ...DefaultBlockStyles,
    ...(options.blockStyles || {}),
  };

  parsedData.forEach(function(item: {
    type?: any;
    level?: any;
    lines?: any;
    children?: any[];
  }) {
    if (item.type === 'bullet_list_open') {
      currentListType = 'unordered_list_item_open';
    } else if (item.type === 'ordered_list_open') {
      currentListType = 'ordered_list_item_open';
    }

    let itemType = item.type;
    if (itemType === 'list_item_open') {
      itemType = currentListType;
    }

    if (itemType === 'inline') {
      const {
        content,
        blockEntities,
        blockEntityRanges,
        blockInlineStyleRanges,
      } = parseInline(item, BlockEntities, BlockStyles);
      const blockToModify = blocks[blocks.length - 1];
      blockToModify.text = content;
      blockToModify.inlineStyleRanges = blockInlineStyleRanges;
      blockToModify.entityRanges = blockEntityRanges;
      if (blockEntityRanges.length > 0) {
        if (
          (blockEntities as any)[blockEntityRanges[0]?.key].type === 'IMAGE'
        ) {
          if (content === '') {
            blockToModify.text = ' ';
            blockToModify.type = 'atomic';
            blockToModify.data = (blockEntities as any)[
              blockEntityRanges[0]?.key
            ].data;
          } else {
            blockToModify.type = 'atomic';
            blockToModify.data = (blockEntities as any)[
              blockEntityRanges[0]?.key
            ].data;
          }
        } else if (
          (blockEntities as any)[blockEntityRanges[0]?.key].type === 'LINK'
        ) {
          blockToModify.type = 'unstyled';
          blockToModify.data = (blockEntities as any)[
            blockEntityRanges[0]?.key
          ].data;
        }
      }
      Object.assign(entityMap, blockEntities);
    } else if (
      (itemType.indexOf('_open') !== -1 ||
        itemType === 'fence' ||
        itemType === 'hr') &&
      BlockTypes[itemType]
    ) {
      let depth = 0;
      let block;

      if (item.level > 0) {
        depth = Math.floor(item.level / 2);
      }

      if (item.level === 0 || item.type === 'list_item_open') {
        block = {
          depth,
          ...BlockTypes[itemType](item),
        };
      } else if (item.level > 0 && blocks[blocks.length - 1].text) {
        block = { ...blocks[blocks.length - 1] };
      }

      if (block && options.preserveNewlines) {
        const totalEmptyParagraphsToCreate =
          item.lines[0] - previousBlockEndingLine;
        for (let i = 0; i < totalEmptyParagraphsToCreate; i += 1) {
          blocks.push(DefaultBlockTypes.paragraph_open());
        }
      }

      if (block) {
        previousBlockEndingLine = item.lines[1];
        blocks.push(block);
      }
    }
  });

  if (!blocks.length) {
    blocks.push(DefaultBlockTypes.paragraph_open());
  }
  return {
    blocks,
    entityMap,
  };
}
export const createFromMarkdown = markdown =>
  EditorState.createWithContent(convertFromRaw(markdownToDraft(markdown)));
export default markdownToDraft;
