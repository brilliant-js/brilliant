import { BlockType, InlineStyle } from '../../types/brilliant';

import { forListEach, isEmptyString } from './common';

const blockTypesMapping = {
  unstyled: 'p',
  'header-one': 'h1',
  'header-two': 'h2',
  'header-three': 'h3',
  'header-four': 'h4',
  'header-five': 'h5',
  'header-six': 'h6',
  'unordered-list-item': 'ul',
  'ordered-list-item': 'ol',
  blockquote: 'blockquote',
  'code-block': 'pre',
};

export function getBlockTag(type: string | number): string {
  return type && blockTypesMapping[type];
}

export function getBlockStyle(data: any): string {
  let styles = '';
  forListEach(data, (key: string, value: string) => {
    if (value) {
      styles += `${key}:${value};`;
    }
  });
  return styles;
}

function getSections(block: BlockType) {
  const sections = [];
  let lastOffset = 0;
  let sectionRanges = block.entityRanges.map(
    (range: { offset: number; length: number; key: string }) => {
      const { offset, length, key } = range;
      return {
        offset,
        length,
        key,
        type: 'ENTITY',
      };
    }
  );
  sectionRanges = sectionRanges.sort((s1, s2) => s1.offset - s2.offset);
  sectionRanges.forEach(r => {
    if (r.offset > lastOffset) {
      sections.push({
        start: lastOffset,
        end: r.offset,
      });
    }
    sections.push({
      start: r.offset,
      end: r.offset + r.length,
      entityKey: r.key,
      type: r.type,
    });
    lastOffset = r.offset + r.length;
  });
  if (lastOffset < block.text.length) {
    sections.push({
      start: lastOffset,
      end: block.text.length,
    });
  }
  return sections;
}

function isAtomicEntityBlock(block: BlockType) {
  if (
    block.entityRanges.length > 0 &&
    (isEmptyString(block.text) || block.type === 'atomic')
  ) {
    return true;
  }
  return false;
}

function getStyleArrayForBlock(block: BlockType) {
  const { text, inlineStyleRanges } = block;
  const inlineStyles = {
    BOLD: new Array(text.length),
    ITALIC: new Array(text.length),
    UNDERLINE: new Array(text.length),
    STRIKETHROUGH: new Array(text.length),
    CODE: new Array(text.length),
    SUPERSCRIPT: new Array(text.length),
    SUBSCRIPT: new Array(text.length),
    COLOR: new Array(text.length),
    BGCOLOR: new Array(text.length),
    FONTSIZE: new Array(text.length),
    FONTFAMILY: new Array(text.length),
    length: text.length,
  };
  if (inlineStyleRanges && inlineStyleRanges.length > 0) {
    inlineStyleRanges.forEach(range => {
      const { offset } = range;
      const length = offset + range.length;
      for (let i = offset; i < length; i += 1) {
        if (range.style.indexOf('color-') === 0) {
          inlineStyles.COLOR[i] = range.style.substring(6);
        } else if (range.style.indexOf('bgcolor-') === 0) {
          inlineStyles.BGCOLOR[i] = range.style.substring(8);
        } else if (range.style.indexOf('fontsize-') === 0) {
          inlineStyles.FONTSIZE[i] = range.style.substring(9);
        } else if (range.style.indexOf('fontfamily-') === 0) {
          inlineStyles.FONTFAMILY[i] = range.style.substring(11);
        } else if (inlineStyles[range.style]) {
          inlineStyles[range.style][i] = true;
        }
      }
    });
  }
  return inlineStyles;
}

export function getStylesAtOffset(
  inlineStyles: InlineStyle,
  offset: string | number
): { [key: string]: boolean } {
  const styles: { [key: string]: boolean } = {};
  if (inlineStyles.COLOR[offset]) {
    styles.COLOR = inlineStyles.COLOR[offset];
  }
  if (inlineStyles.BGCOLOR[offset]) {
    styles.BGCOLOR = inlineStyles.BGCOLOR[offset];
  }
  if (inlineStyles.FONTSIZE[offset]) {
    styles.FONTSIZE = inlineStyles.FONTSIZE[offset];
  }
  if (inlineStyles.FONTFAMILY[offset]) {
    styles.FONTFAMILY = inlineStyles.FONTFAMILY[offset];
  }
  if (inlineStyles.UNDERLINE[offset]) {
    styles.UNDERLINE = true;
  }
  if (inlineStyles.ITALIC[offset]) {
    styles.ITALIC = true;
  }
  if (inlineStyles.BOLD[offset]) {
    styles.BOLD = true;
  }
  if (inlineStyles.STRIKETHROUGH[offset]) {
    styles.STRIKETHROUGH = true;
  }
  if (inlineStyles.CODE[offset]) {
    styles.CODE = true;
  }
  if (inlineStyles.SUBSCRIPT[offset]) {
    styles.SUBSCRIPT = true;
  }
  if (inlineStyles.SUPERSCRIPT[offset]) {
    styles.SUPERSCRIPT = true;
  }

  return styles;
}

export function sameStyleAsPrevious(
  inlineStyles: any,
  styles: any[],
  index: number
): boolean {
  let sameStyled = true;
  if (index > 0 && index < inlineStyles.length) {
    styles.forEach((style: string | number) => {
      sameStyled =
        sameStyled &&
        inlineStyles[style][index] === inlineStyles[style][index - 1];
    });
  } else {
    sameStyled = false;
  }
  return sameStyled;
}

export function addInlineStyleMarkup(style: string, content: string): string {
  if (style === 'BOLD') {
    return `<strong>${content}</strong>`;
  }
  if (style === 'ITALIC') {
    return `<em>${content}</em>`;
  }
  if (style === 'UNDERLINE') {
    return `<ins>${content}</ins>`;
  }
  if (style === 'STRIKETHROUGH') {
    return `<del>${content}</del>`;
  }
  if (style === 'CODE') {
    return `<code>${content}</code>`;
  }
  if (style === 'SUPERSCRIPT') {
    return `<sup>${content}</sup>`;
  }
  if (style === 'SUBSCRIPT') {
    return `<sub>${content}</sub>`;
  }
  return content;
}

function getSectionText(text: any[]) {
  if (text && text.length > 0) {
    const chars = text.map((ch: any) => {
      switch (ch) {
        case '\n':
          return '<br>';
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        default:
          return ch;
      }
    });
    return chars.join('');
  }
  return '';
}

export function addStylePropertyMarkup(
  styles: { COLOR: any; BGCOLOR: any; FONTSIZE: string; FONTFAMILY: any },
  text: string
) {
  if (
    styles &&
    (styles.COLOR || styles.BGCOLOR || styles.FONTSIZE || styles.FONTFAMILY)
  ) {
    let styleString = 'style="';
    if (styles.COLOR) {
      styleString += `color: ${styles.COLOR};`;
    }
    if (styles.BGCOLOR) {
      styleString += `background-color: ${styles.BGCOLOR};`;
    }
    if (styles.FONTSIZE) {
      styleString += `font-size: ${styles.FONTSIZE}${
        /^\d+$/.test(styles.FONTSIZE) ? 'px' : ''
      };`;
    }
    if (styles.FONTFAMILY) {
      styleString += `font-family: ${styles.FONTFAMILY};`;
    }
    styleString += '"';
    return `<span ${styleString}>${text}</span>`;
  }
  return text;
}

function getEntityMarkup(
  entityMap: { [x: string]: any },
  entityKey: string | number,
  text: string
) {
  const entity = entityMap[entityKey];
  if (entity.type === 'MRENTION') {
    return `<a href="${entity.data.url}" class="wysiwyg-mention" data-mention data-value="${entity.data.value}">${text}</a>`;
  }
  if (entity.type === 'LINK') {
    const targetOption = entity.data.targetOption || '_self';
    return `<a href="${entity.data.url}" target="${targetOption}">${text}</a>`;
  }
  if (entity.type === 'IMAGE') {
    const { alignment } = entity.data;
    if (alignment && alignment.length) {
      return `<div style="text-align:${alignment};"><img src="${entity.data.src}" alt="${entity.data.alt}" style="height: ${entity.data.height}px;width: ${entity.data.width}px;text-align:${alignment}"/></div>`;
    }
    return `<img src="${entity.data.src}" alt="${entity.data.alt}" style="height: ${entity.data.height}px;width: ${entity.data.width}px"/>`;
  }
  if (entity.type === 'EMBEDDED_LINK') {
    return `<iframe width="${entity.data.width}" height="${entity.data.height}" src="${entity.data.src}" frameBorder="0"></iframe>`;
  }
  return text;
}

function getInlineStyleSections(
  block: BlockType,
  styles: string[],
  start: any,
  end: number
) {
  const styleSections = [];
  const text = Array.from(block.text);
  if (text.length > 0) {
    const inlineStyles = getStyleArrayForBlock(block);
    let section: { text: any; end: any; styles?: any; start?: any };
    for (let i = start; i < end; i += 1) {
      if (i !== start && sameStyleAsPrevious(inlineStyles, styles, i)) {
        section.text.push(text[i]);
        section.end = i + 1;
      } else {
        section = {
          styles: getStylesAtOffset(inlineStyles, i),
          text: [text[i]],
          start: i,
          end: i + 1,
        };
        styleSections.push(section);
      }
    }
  }
  return styleSections;
}

export function trimLeadingZeros(sectionText: string) {
  if (sectionText) {
    let replacedText = sectionText;
    for (let i = 0; i < replacedText.length; i += 1) {
      if (sectionText[i] === ' ') {
        replacedText = replacedText.replace(' ', '&nbsp;');
      } else {
        break;
      }
    }
    return replacedText;
  }
  return sectionText;
}

export function trimTrailingZeros(sectionText: string) {
  if (sectionText) {
    let replacedText = sectionText;
    for (let i = replacedText.length - 1; i >= 0; i -= 1) {
      if (replacedText[i] === ' ') {
        replacedText = `${replacedText.substring(
          0,
          i
        )}&nbsp;${replacedText.substring(i + 1)}`;
      } else {
        break;
      }
    }
    return replacedText;
  }
  return sectionText;
}

function getStyleTagSectionMarkup(styleSection: { styles: any; text: any }) {
  const { styles, text } = styleSection;
  let content = getSectionText(text);
  forListEach(styles, (style: any, value: any) => {
    content = addInlineStyleMarkup(style, content);
  });
  return content;
}

function getInlineStyleSectionMarkup(
  block: any,
  styleSection: { start: any; end: any; styles: any }
) {
  const styleTagSections = getInlineStyleSections(
    block,
    [
      'BOLD',
      'ITALIC',
      'UNDERLINE',
      'STRIKETHROUGH',
      'CODE',
      'SUPERSCRIPT',
      'SUBSCRIPT',
    ],
    styleSection.start,
    styleSection.end
  );
  let styleSectionText = '';
  styleTagSections.forEach(stylePropertySection => {
    styleSectionText += getStyleTagSectionMarkup(stylePropertySection);
  });
  styleSectionText = addStylePropertyMarkup(
    styleSection.styles,
    styleSectionText
  );
  return styleSectionText;
}

function getSectionMarkup(
  block: any,
  entityMap: any,
  section: { start: any; end: any; type: string; entityKey: any }
) {
  const entityInlineMarkup = [];
  const inlineStyleSections = getInlineStyleSections(
    block,
    ['COLOR', 'BGCOLOR', 'FONTSIZE', 'FONTFAMILY'],
    section.start,
    section.end
  );
  inlineStyleSections.forEach(styleSection => {
    entityInlineMarkup.push(getInlineStyleSectionMarkup(block, styleSection));
  });
  let sectionText = entityInlineMarkup.join('');
  if (section.type === 'ENTITY') {
    if (section.entityKey !== undefined && section.entityKey !== null) {
      sectionText = getEntityMarkup(entityMap, section.entityKey, sectionText);
    }
  } else if (section.type === 'HASHTAG') {
    sectionText = `<a href="${sectionText}" class="wysiwyg-hashtag">${sectionText}</a>`;
  }
  return sectionText;
}

export function getBlockInnerMarkup(block: BlockType, entityMap: any) {
  const blockMarkup = [];
  const sections = getSections(block);
  sections.forEach((section, index) => {
    let sectionText = getSectionMarkup(block, entityMap, section);
    if (index === 0) {
      sectionText = trimLeadingZeros(sectionText);
    }
    if (index === sections.length - 1) {
      sectionText = trimTrailingZeros(sectionText);
    }
    blockMarkup.push(sectionText);
  });
  return blockMarkup.join('');
}

export function getBlockMarkup(block: BlockType, entityMap: any) {
  const blockHtml = [];
  if (isAtomicEntityBlock(block)) {
    blockHtml.push(
      getEntityMarkup(entityMap, block.entityRanges[0].key, undefined)
    );
  } else {
    const blockTag = getBlockTag(block.type);
    if (blockTag) {
      blockHtml.push(`<${blockTag}`);
      const blockStyle = getBlockStyle(block.data);
      if (blockStyle) {
        blockHtml.push(` style="${blockStyle}"`);
      }
      blockHtml.push('>');
      blockHtml.push(getBlockInnerMarkup(block, entityMap));
      blockHtml.push(`</${blockTag}>`);
    }
  }
  blockHtml.push('\n');
  return blockHtml.join('');
}
