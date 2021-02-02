import { getBlockTag, getBlockStyle, getBlockInnerMarkup } from './block';

export function isList(blockType) {
  return (
    blockType === 'unordered-list-item' || blockType === 'ordered-list-item'
  );
}

export function getListMarkup(listBlocks, entityMap) {
  const listHtml = [];
  let nestedListBlock = [];
  let previousBlock: { type: any; depth: any };
  listBlocks.forEach(block => {
    let nestedBlock = false;
    if (!previousBlock) {
      listHtml.push(`<${getBlockTag(block.type)}>\n`);
    } else if (previousBlock.type !== block.type) {
      listHtml.push(`</${getBlockTag(previousBlock.type)}>\n`);
      listHtml.push(`<${getBlockTag(block.type)}>\n`);
    } else if (previousBlock.depth === block.depth) {
      if (nestedListBlock && nestedListBlock.length > 0) {
        listHtml.push(getListMarkup(nestedListBlock, entityMap));
        nestedListBlock = [];
      }
    } else {
      nestedBlock = true;
      nestedListBlock.push(block);
    }
    if (!nestedBlock) {
      listHtml.push('<li');
      const blockStyle = getBlockStyle(block.data);
      if (blockStyle) {
        listHtml.push(` style="${blockStyle}"`);
      }
      listHtml.push('>');
      listHtml.push(getBlockInnerMarkup(block, entityMap));
      listHtml.push('</li>\n');
      previousBlock = block;
    }
  });
  if (nestedListBlock && nestedListBlock.length > 0) {
    listHtml.push(getListMarkup(nestedListBlock, entityMap));
  }
  listHtml.push(`</${getBlockTag(previousBlock.type)}>\n`);
  return listHtml.join('');
}
