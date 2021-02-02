const TRAILING_WHITESPACE = /[ \u0020\t\n]*$/;

const MARKDOWN_STYLE_CHARACTERS = ['*', '_', '~', '`'];
const MARKDOWN_STYLE_CHARACTER_REGXP = /(\*|_|~|\\|`)/g;

let orderedListNumber: number[] = [];
let previousOrderedListDepth = 0;

const StyleItems = {
  'unordered-list-item': {
    open() {
      return '- ';
    },

    close() {
      return '';
    },
  },

  'ordered-list-item': {
    open(number = 1) {
      return `${number}. `;
    },

    close() {
      return '';
    },
  },

  blockquote: {
    open() {
      return '> ';
    },

    close() {
      return '';
    },
  },

  'header-one': {
    open() {
      return '# ';
    },

    close() {
      return '';
    },
  },

  'header-two': {
    open() {
      return '## ';
    },

    close() {
      return '';
    },
  },

  'header-three': {
    open() {
      return '### ';
    },

    close() {
      return '';
    },
  },

  'header-four': {
    open() {
      return '#### ';
    },

    close() {
      return '';
    },
  },

  'header-five': {
    open() {
      return '##### ';
    },

    close() {
      return '';
    },
  },

  'header-six': {
    open() {
      return '###### ';
    },

    close() {
      return '';
    },
  },

  'code-block': {
    open(block: { data: { language: any } }) {
      return `\`\`\`${block.data.language || ''}\n`;
    },

    close() {
      return '\n```';
    },
  },

  BOLD: {
    open() {
      return '**';
    },

    close() {
      return '**';
    },
  },

  ITALIC: {
    open() {
      return ' _';
    },
    lineOpen() {
      return '_';
    },
    close() {
      return '_ ';
    },
    lineClose() {
      return '_';
    },
  },

  STRIKETHROUGH: {
    open() {
      return '~~';
    },

    close() {
      return '~~';
    },
  },

  CODE: {
    open() {
      return '`';
    },

    close() {
      return '`';
    },
  },
};
interface ItemsType {
  [key: string]: any;
}
const EntityItems = {
  LINK: {
    open() {
      return '[';
    },

    close(entity: { data: { url: any; imagehref: any } }) {
      return `](${entity.data.url})`;
    },
  },
  IMAGE: {
    open() {
      return '![';
    },

    close(entity: { data: { src: any } }) {
      return `](${entity.data.src})`;
    },
  },
};

const SingleNewlineAfterBlock = ['unordered-list-item', 'ordered-list-item'];

function isEmptyBlock(block: {
  text: string | any[];
  entityRanges: string | any[];
  data: any;
}) {
  return (
    block.text.length === 0 &&
    block.entityRanges.length === 0 &&
    Object.keys(block.data || {}).length === 0
  );
}

function renderBlock(
  block: any,
  index: any,
  rawDraftObject: any,
  options: any
) {
  const openInlineStyles = [];
  let markdownToAdd: { type: string; style?: any; value: any }[] = [];
  let markdownString = '';
  const customStyleItems = options.styleItems || {};
  const customEntityItems = options.entityItems || {};
  const escapeMarkdownCharacters = options.hasOwnProperty(
    'escapeMarkdownCharacters'
  )
    ? options.escapeMarkdownCharacters
    : true;

  let { type } = block;

  const markdownStyleCharactersToEscape: {
    character: unknown;
    index: number;
    markdownStringIndexStart: number;
    markdownStringIndexEnd: any;
  }[] = [];

  if (isEmptyBlock(block) && !options.preserveNewlines) {
    type = 'unstyled';
  }

  if (customStyleItems[type] || (StyleItems as ItemsType)[type]) {
    if (type === 'unordered-list-item' || type === 'ordered-list-item') {
      markdownString += ' '.repeat(block.depth * 4);
    }

    if (type === 'ordered-list-item') {
      orderedListNumber[block.depth] = orderedListNumber[block.depth] || 1;
      markdownString += (
        customStyleItems[type] || (StyleItems as ItemsType)[type]
      ).open(block, orderedListNumber[block.depth]);
      orderedListNumber[block.depth] += 1;

      if (previousOrderedListDepth > block.depth) {
        orderedListNumber[previousOrderedListDepth] = 1;
      }

      previousOrderedListDepth = block.depth;
    } else if (type === 'italic') {
      orderedListNumber = [];
      markdownString += (
        customStyleItems[type] || (StyleItems as ItemsType)[type]
      ).lineOpen(block);
    } else {
      orderedListNumber = [];
      markdownString += (
        customStyleItems[type] || (StyleItems as ItemsType)[type]
      ).open(block);
    }
  }

  const openTags: any[] = [];

  function openTag(tag: { style: string | number; key: string | number }) {
    openTags.push(tag);
    if (tag.style) {
      if (customStyleItems[tag.style] || (StyleItems as ItemsType)[tag.style]) {
        const styleToAdd = (
          customStyleItems[tag.style] || (StyleItems as ItemsType)[tag.style]
        ).open();
        markdownToAdd.push({
          type: 'style',
          style: tag,
          value: styleToAdd,
        });
      }
    } else {
      const entity = rawDraftObject.entityMap[tag.key];
      if (entity) {
        if (
          customEntityItems[entity.type] ||
          (EntityItems as ItemsType)[entity.type]
        ) {
          const entityToAdd = (
            customEntityItems[entity.type] ||
            (EntityItems as ItemsType)[entity.type]
          ).open(entity);
          markdownToAdd.push({
            type: 'entity',
            value: entityToAdd,
          });
        }
      }
    }
  }

  function closeTag(tag: { style: string | number; key: string | number }) {
    const popped = openTags.pop();
    if (tag !== popped) {
      throw new Error(
        'Invariant violation: Cannot close a tag before all inner tags have been closed'
      );
    }

    if (tag.style) {
      if (customStyleItems[tag.style] || (StyleItems as ItemsType)[tag.style]) {
        const trailingWhitespace = TRAILING_WHITESPACE.exec(markdownString);
        markdownString = markdownString.slice(
          0,
          markdownString.length - trailingWhitespace![0].length
        );

        markdownString += (
          customStyleItems[tag.style] || (StyleItems as ItemsType)[tag.style]
        ).close();
        markdownString += trailingWhitespace![0];
      }
    } else {
      const entity = rawDraftObject.entityMap[tag.key];
      if (entity) {
        if (
          customEntityItems[entity.type] ||
          (EntityItems as ItemsType)[entity.type]
        ) {
          markdownString += (
            customEntityItems[entity.type] ||
            (EntityItems as ItemsType)[entity.type]
          ).close(entity);
        }
      }
    }
  }

  const compareTagsLastCloseFirst = (
    a: { offset: any; length: any },
    b: { offset: any; length: any }
  ) => b.offset + b.length - (a.offset + a.length);

  const reverse = (array: any[]) => array.concat().reverse();

  Array.from(block.text).some(function(character: any, characterIndex) {
    reverse(openTags).forEach((tag, indexNum) => {
      if (tag.offset + tag.length === characterIndex) {
        const tagsToSplit = openTags.slice(openTags.indexOf(tag) + 1);

        reverse(tagsToSplit).forEach(closeTag);

        closeTag(tag);

        tagsToSplit.sort(compareTagsLastCloseFirst).forEach(openTag);
      }
    });

    const inlineTagsToOpen = block.inlineStyleRanges.filter(
      (tag: { offset: number }) => tag.offset === characterIndex
    );
    const entityTagsToOpen = block.entityRanges.filter(
      (tag: { offset: number }) => tag.offset === characterIndex
    );
    inlineTagsToOpen
      .concat(entityTagsToOpen)
      .sort(compareTagsLastCloseFirst)
      .forEach(openTag);
    if (block.type !== 'atomic') {
      if (character !== ' ' && markdownToAdd.length) {
        markdownString += markdownToAdd
          .map(function(item) {
            return item.value;
          })
          .join('');

        markdownToAdd = [];
      }
    } else {
      markdownString += markdownToAdd
        .map(function(item) {
          return item.value;
        })
        .join('');
      markdownToAdd = [];
    }

    if (block.type !== 'code-block' && escapeMarkdownCharacters) {
      const insideInlineCodeStyle = openTags.find(
        style => style.style === 'CODE'
      );
      if (insideInlineCodeStyle) {
      } else {
        if (
          characterIndex === 0 &&
          character === '#' &&
          block.text[1] &&
          block.text[1] === ' '
        ) {
          character = character.replace('#', '\\#');
        } else if (characterIndex === 0 && character === '>') {
          character = character.replace('>', '\\>');
        }
        if (MARKDOWN_STYLE_CHARACTERS.includes(character)) {
          const openingStyle = markdownStyleCharactersToEscape.find(function(
            item
          ) {
            return item.character === character;
          });
          if (
            !openingStyle &&
            block.text[characterIndex - 1] === ' ' &&
            block.text[characterIndex + 1] !== ' '
          ) {
            markdownStyleCharactersToEscape.push({
              character,
              index: characterIndex,
              markdownStringIndexStart:
                markdownString.length + character.length - 1,
              markdownStringIndexEnd: markdownString.length + character.length,
            });
          } else if (
            openingStyle &&
            block.text[characterIndex - 1] === character &&
            characterIndex === openingStyle.index + 1
          ) {
            openingStyle.markdownStringIndexEnd += 1;
          } else if (openingStyle) {
            const openingStyleLength =
              openingStyle.markdownStringIndexEnd -
              openingStyle.markdownStringIndexStart;
            let escapeCharacter = false;
            let popOpeningStyle = false;
            if (
              openingStyleLength === 1 &&
              (block.text[characterIndex + 1] === ' ' ||
                !block.text[characterIndex + 1])
            ) {
              popOpeningStyle = true;
              escapeCharacter = true;
            }

            if (
              openingStyleLength === 2 &&
              block.text[characterIndex + 1] === character
            ) {
              escapeCharacter = true;
            }

            if (
              openingStyleLength === 2 &&
              block.text[characterIndex - 1] === character &&
              (block.text[characterIndex + 1] === ' ' ||
                !block.text[characterIndex + 1])
            ) {
              popOpeningStyle = true;
              escapeCharacter = true;
            }

            if (popOpeningStyle) {
              markdownStyleCharactersToEscape.splice(
                markdownStyleCharactersToEscape.indexOf(openingStyle),
                1
              );
              let replacementString = markdownString.slice(
                openingStyle.markdownStringIndexStart,
                openingStyle.markdownStringIndexEnd
              );
              replacementString = replacementString.replace(
                MARKDOWN_STYLE_CHARACTER_REGXP,
                '\\$1'
              );
              markdownString =
                markdownString.slice(0, openingStyle.markdownStringIndexStart) +
                replacementString +
                markdownString.slice(openingStyle.markdownStringIndexEnd);
            }

            if (escapeCharacter) {
              character = `\\${character}`;
            }
          }
        }
      }
    }

    if (character === '\n' && type === 'blockquote') {
      markdownString += '\n> ';
    } else {
      const newText = character.replace(/\s{2,}/g, ' ');
      markdownString += newText;
    }
  });

  reverse(openTags).forEach(closeTag);

  if (customStyleItems[type] || (StyleItems as ItemsType)[type]) {
    if (type === 'italic') {
      markdownString += (
        customStyleItems[type] || (StyleItems as ItemsType)[type]
      ).lineClose(block);
    } else {
      markdownString += (
        customStyleItems[type] || (StyleItems as ItemsType)[type]
      ).close(block);
    }
  }
  if (
    SingleNewlineAfterBlock.indexOf(type) !== -1 &&
    rawDraftObject.blocks[index + 1] &&
    SingleNewlineAfterBlock.indexOf(rawDraftObject.blocks[index + 1].type) !==
      -1
  ) {
    markdownString += '\n';
  } else if (rawDraftObject.blocks[index + 1]) {
    if (rawDraftObject.blocks[index].text) {
      if (
        SingleNewlineAfterBlock.indexOf(type) !== -1 &&
        SingleNewlineAfterBlock.indexOf(
          rawDraftObject.blocks[index + 1].type
        ) === -1
      ) {
        markdownString += '\n\n';
      } else if (!options.preserveNewlines) {
        markdownString += '\n\n';
      } else {
        markdownString += '\n';
      }
    } else if (options.preserveNewlines) {
      markdownString += '\n';
    }
  }

  return markdownString;
}

function draftToMarkdown(rawDraftObject: { blocks: any[] }, options?: {}) {
  options = options || {};
  let markdownString = '';
  rawDraftObject.blocks.forEach(function(block, index) {
    if (block)
      markdownString += renderBlock(block, index, rawDraftObject, options);
  });

  orderedListNumber = [];
  return markdownString;
}

export default draftToMarkdown;
