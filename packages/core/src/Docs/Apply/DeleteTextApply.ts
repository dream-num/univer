import { ITextSelectionRangeParam } from '../../Interfaces/ISelectionData';
import { DocumentModel } from '../Domain/DocumentModel';
import { getDocsUpdateBody } from './Common';

export function DeleteTextApply(
    document: DocumentModel,
    range: ITextSelectionRangeParam
) {
    const doc = document.snapshot;

    const { segmentId } = range;

    const body = getDocsUpdateBody(doc, segmentId);

    if (body == null) {
        throw new Error('no body has changed');
    }

    // const { blockElements } = body;

    // for (let blockElement of blockElements) {
    //     if (blockElement == null) {
    //         continue;
    //     }

    //     const { blockType } = blockElement;

    //     switch (blockType) {
    //         case BlockType.PARAGRAPH:
    //             if (blockElement.paragraph) {
    //                 deleteText(blockElement, blockElement.paragraph, range);
    //             }
    //     }
    // }
}

// function deleteText(
//     blockElement: IBlockElement,
//     paragraph: IParagraph,
//     range: ITextSelectionRangeParam
// ) {
//     const { cursorStart, cursorEnd, isStartBack, isEndBack, isCollapse } = range;

//     const textStart = getTextIndexByCursor(cursorStart, isStartBack);

//     const textEnd = getTextIndexByCursor(cursorEnd, isEndBack);

//     const { st: blockStartIndex, ed: blockEndIndex } = blockElement;

//     if (cursorStart > blockEndIndex || cursorEnd < blockStartIndex) {
//         return;
//     }

//     const { elements } = paragraph;

//     let index = 0;

//     for (let element of elements) {
//         const { et: paragraphElementType } = element;

//         if (paragraphElementType === ParagraphElementType.DRAWING) {
//             index++;
//             continue;
//         }

//         const { st: elementStartIndex, ed: elementEndIndex, tr } = element;

//         if (tr == null || tr.tab === BooleanNumber.TRUE) {
//             index++;
//             continue;
//         }
//         if (textEnd < elementStartIndex || textStart > elementEndIndex) {
//             index++;
//             continue;
//         }

//         if (paragraphElementType === ParagraphElementType.TEXT_RUN) {
//             let relativeStart = textStart - elementStartIndex + 1;

//             let relativeEnd = textEnd - elementStartIndex + 1;

//             if (relativeStart <= 0) {
//                 relativeStart = 0;
//             }

//             if (relativeEnd >= elementEndIndex - elementStartIndex - 1) {
//                 relativeStart = elementEndIndex - elementStartIndex - 1;
//             }

//             const newContent = deleteContent(
//                 tr.ct || '',
//                 relativeStart,
//                 relativeEnd
//             );

//             tr.ct = newContent;
//         }

//         if (tr.ct?.length === 0) {
//             elements.splice(index, 1);
//         } else {
//             const preTr = elements[index - 1]?.tr;

//             if (!preTr) {
//                 index++;
//                 continue;
//             }

//             const m = mergeSameTextRun(tr, preTr);

//             if (m) {
//                 elements.splice(index, 1);
//             } else {
//                 index++;
//             }
//         }
//     }
// }
