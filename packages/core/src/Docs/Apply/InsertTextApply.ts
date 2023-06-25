import { IDocumentBody } from '../../Interfaces/IDocumentData';
import { ITextSelectionRangeStartParam } from '../../Interfaces/ISelectionData';
import { DocumentModel } from '../Domain/DocumentModel';
import { getDocsUpdateBody } from './Common';

export function InsertTextApply(
    document: DocumentModel,
    insertBody: IDocumentBody,
    textLength: number,
    collapseRange: ITextSelectionRangeStartParam
) {
    const doc = document.snapshot;

    const { segmentId } = collapseRange;

    const body = getDocsUpdateBody(doc, segmentId);

    if (textLength === 0) {
        return;
    }

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
    //             blockElement.paragraph &&
    //                 insertText(
    //                     text,
    //                     textLength,
    //                     blockElement,
    //                     blockElement.paragraph,
    //                     collapseRange
    //                 );
    //     }
    // }
}

// function insertText(
//     text: string | IElement[],
//     textLength: number,
//     blockElement: IBlockElement,
//     paragraph: IParagraph,
//     collapseRange: ITextSelectionRangeStartParam
// ) {
//     const { st: blockStartIndex, ed: blockEndIndex } = blockElement;

//     const { cursorStart, isStartBack, segmentId } = collapseRange;

//     const textStart = getTextIndexByCursor(cursorStart, isStartBack);

//     if (textStart > blockEndIndex || paragraph == null) {
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
//         if (textStart < elementStartIndex || textStart > elementEndIndex) {
//             index++;
//             continue;
//         }

//         console.log(
//             'paragraphApply',
//             textStart,
//             elementStartIndex,
//             elementEndIndex,
//             element,
//             textStart < elementStartIndex || textStart > elementEndIndex
//         );

//         if (paragraphElementType === ParagraphElementType.TEXT_RUN) {
//             let relativeStart = textStart - elementStartIndex + 1;

//             if (relativeStart <= 0) {
//                 relativeStart = 0;
//             }

//             if (text instanceof Object) {
//                 const nextEle = elements[index + 1];
//                 const insertedElements = splitTextRun(
//                     text,
//                     textLength,
//                     relativeStart,
//                     element,
//                     nextEle
//                 );
//             } else {
//                 const newContent = insertTextToContent(
//                     tr.ct || '',
//                     relativeStart,
//                     text as string
//                 );

//                 tr.ct = newContent;

//                 index++;
//             }
//         }
//     }
// }

// function splitTextRun(
//     insertTextRunList: IElement[],
//     textLength: number,
//     relativeStart: number,
//     currentElement: IElement,
//     nextElement: IElement
// ) {
//     const trLen = insertTextRunList.length;

//     const insertLastTrEle = insertTextRunList[trLen - 1];

//     const {
//         st: currentStartIndex,
//         ed: currentEndIndex,
//         tr: currentTr,
//     } = currentElement;

//     const currentContent = currentTr?.ct || '';

//     const newElements: IElement[] = [];

//     if (trLen === 1) {
//         const splitLeft = currentContent.slice(0, relativeStart);

//         const splitRight = currentContent.slice(relativeStart);
//     } else if (trLen > 1) {
//         const splitLeft = currentContent.slice(0, relativeStart);

//         const splitRight = currentContent.slice(relativeStart);
//     }
// }
