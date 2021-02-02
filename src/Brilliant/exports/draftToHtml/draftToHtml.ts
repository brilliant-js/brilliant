import { getBlockMarkup } from './block';
import { getListMarkup, isList } from './list';

export default function draftToHtml(editorContent) {
  const html = [];
  if (editorContent) {
    const { blocks, entityMap } = editorContent;
    if (blocks && blocks.length > 0) {
      let listBlocks = [];
      blocks.forEach(block => {
        if (isList(block.type)) {
          listBlocks.push(block);
        } else {
          if (listBlocks.length > 0) {
            const listHtml = getListMarkup(listBlocks, entityMap);
            html.push(listHtml);
            listBlocks = [];
          }
          const blockHtml = getBlockMarkup(block, entityMap);
          html.push(blockHtml);
        }
      });
      if (listBlocks.length > 0) {
        const listHtml = getListMarkup(listBlocks, entityMap);
        html.push(listHtml);
        listBlocks = [];
      }
    }
  }
  return html.join('');
}
