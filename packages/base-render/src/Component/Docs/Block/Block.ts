import { BlockType, Context, IBlockElement } from '@univer/core';
import { dealWidthParagraph, dealWithBlockError } from '.';
import { updateBlockIndex } from '..';
import { dealWidthCustomBlock, IDocumentSkeletonPage, ISectionBreakConfig, ISkeletonResourceReference } from '../../..';

export function dealWithBlocks(
    Blocks: IBlockElement[],
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    preRenderedBlockIdMap?: Map<string, boolean>,
    context?: Context
) {
    const allCurrentSkeletonPages: IDocumentSkeletonPage[] = [];
    const renderedBlockIdMap = new Map<string, boolean>();
    for (let block of Blocks) {
        const { paragraph, table, tableOfContents, blockType, customBlock, blockId } = block;
        if (preRenderedBlockIdMap?.get(blockId)) {
            continue;
        }
        let blockSkeletonPages: IDocumentSkeletonPage[] = [];
        let currentPageCache = curPage;
        if (allCurrentSkeletonPages.length > 0) {
            currentPageCache = allCurrentSkeletonPages[allCurrentSkeletonPages.length - 1];
        }
        if (blockType === BlockType.PARAGRAPH && paragraph) {
            // Paragraph 段落
            blockSkeletonPages = dealWidthParagraph(block.blockId, paragraph, currentPageCache, sectionBreakConfig, skeletonResourceReference, context);
        } else if (blockType === BlockType.TABLE && table) {
            // Table 表格
        } else if (blockType === BlockType.SECTION_BREAK && tableOfContents) {
            // TableOfContents 目录
        } else if (blockType === BlockType.CUSTOM) {
            blockSkeletonPages = dealWidthCustomBlock(block.blockId, customBlock, currentPageCache, sectionBreakConfig, skeletonResourceReference, context);
        }

        if (blockSkeletonPages.length === 0) {
            blockSkeletonPages = dealWithBlockError();
        }

        updateBlockIndex(blockSkeletonPages);

        _pushPage(allCurrentSkeletonPages, blockSkeletonPages);

        renderedBlockIdMap.set(blockId, true);
    }

    return {
        pages: allCurrentSkeletonPages,
        renderedBlockIdMap,
    };
}

function _pushPage(allCurrentSkeletonPages: IDocumentSkeletonPage[], blockSkeletonPages: IDocumentSkeletonPage[]) {
    const lastOldPage = allCurrentSkeletonPages[allCurrentSkeletonPages.length - 1];
    const firstNewPage = blockSkeletonPages[0];
    if (lastOldPage === firstNewPage) {
        blockSkeletonPages.splice(0, 1);
    }
    allCurrentSkeletonPages.push(...blockSkeletonPages);
}

// 当本节有多个列，且下一节为连续节类型的时候，需要按照列数分割，重新计算lines
export function dealWidthBlocksByMultiColumnAndContinuous() {}
