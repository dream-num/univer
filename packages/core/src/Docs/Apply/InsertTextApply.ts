import { BooleanNumber } from '../../Enum/TextStyle';
import {
    BlockType,
    IBlockElement,
    IParagraph,
    ParagraphElementType,
} from '../../Interfaces/IDocumentData';
import { ITextSelectionRangeStartParam } from '../../Interfaces/ISelectionData';
import { DocumentModel } from '../Domain/DocumentModel';
import {
    getDocsUpdateBody,
    insertTextToContent,
    getTextIndexByCursor,
} from './Common';

export function InsertTextApply(
    document: DocumentModel,
    text: string,
    collapseRange: ITextSelectionRangeStartParam
) {
    const doc = document.getSnapshot();

    const { segmentId } = collapseRange;

    const body = getDocsUpdateBody(doc, segmentId);

    if (text.length === 0) {
        return;
    }

    if (body == null) {
        throw new Error('no body has changed');
    }

    const { blockElements } = body;

    for (let blockElement of blockElements) {
        if (blockElement == null) {
            continue;
        }

        const { blockType } = blockElement;

        switch (blockType) {
            case BlockType.PARAGRAPH:
                blockElement.paragraph &&
                    insertText(
                        text,
                        blockElement,
                        blockElement.paragraph,
                        collapseRange
                    );
        }
    }
}

function insertText(
    text: string,
    blockElement: IBlockElement,
    paragraph: IParagraph,
    collapseRange: ITextSelectionRangeStartParam
) {
    const { st: blockStartIndex, ed: blockEndIndex } = blockElement;

    const { cursorStart, isStartBack, segmentId } = collapseRange;

    const textStart = getTextIndexByCursor(cursorStart, isStartBack);

    if (textStart > blockEndIndex || paragraph == null) {
        return;
    }

    const { elements } = paragraph;

    for (let element of elements) {
        const { et: paragraphElementType } = element;

        if (paragraphElementType === ParagraphElementType.DRAWING) {
            continue;
        }

        const { st: elementStartIndex, ed: elementEndIndex, tr } = element;

        if (tr == null || tr.tab === BooleanNumber.TRUE) {
            continue;
        }
        if (textStart < elementStartIndex || textStart > elementEndIndex) {
            continue;
        }

        console.log(
            'paragraphApply',
            textStart,
            elementStartIndex,
            elementEndIndex,
            element,
            textStart < elementStartIndex || textStart > elementEndIndex
        );

        if (paragraphElementType === ParagraphElementType.TEXT_RUN) {
            let relativeStart = textStart - elementStartIndex + 1;

            if (relativeStart <= 0) {
                relativeStart = 0;
            }

            const newContent = insertTextToContent(tr.ct || '', relativeStart, text);

            tr.ct = newContent;
        }
    }
}
