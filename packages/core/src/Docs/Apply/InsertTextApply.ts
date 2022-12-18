import { BooleanNumber } from '../../Enum/TextStyle';
import {
    BlockType,
    IBlockElement,
    IParagraph,
    ParagraphElementType,
} from '../../Interfaces/IDocumentData';
import { DocumentModel } from '../Domain/DocumentModel';
import {
    getTextStartByAnchor,
    insertTextToContent,
    moveBlockCharIndex,
    moveElementCharIndex,
} from './Common';

export function InsertTextApply(
    document: DocumentModel,
    config: { text: string; start: number; length: number; segmentId?: string }
) {
    const doc = document.getSnapshot();
    const { text, start, length, segmentId } = config;

    const textStart = getTextStartByAnchor(start);

    let body = doc.body;

    if (length === 0) {
        return;
    }

    if (segmentId) {
        const { headers, footers } = doc;
        if (headers?.[segmentId]) {
            body = headers[segmentId].body;
        } else if (footers?.[segmentId]) {
            body = footers[segmentId].body;
        }
    }

    if (body == null) {
        throw new Error('no body has changed');
    }

    const { blockElements, blockElementOrder } = body;

    let isApplied = false;

    for (let blockId of blockElementOrder) {
        const blockElement = blockElements[blockId];
        if (blockElement == null) {
            continue;
        }

        const { blockType } = blockElement;

        switch (blockType) {
            case BlockType.PARAGRAPH:
                isApplied = paragraphApply(
                    text,
                    start,
                    textStart,
                    length,
                    blockElement,
                    blockElement.paragraph,
                    isApplied
                );
        }
    }
}

function paragraphApply(
    text: string,
    start: number,
    textStart: number,
    length: number,
    blockElement: IBlockElement,
    paragraph?: IParagraph,
    isApplied: boolean = false
) {
    if (isApplied) {
        moveBlockCharIndex(blockElement, length);
    }

    const { st, ed } = blockElement;

    let isApply = false;

    if (textStart > ed) {
        return isApply;
    }

    if (paragraph == null) {
        return isApply;
    }

    const { elements, elementOrder } = paragraph;

    for (let elementInfo of elementOrder) {
        const { elementId, paragraphElementType } = elementInfo;
        const element = elements[elementId];

        if (paragraphElementType === ParagraphElementType.DRAWING) {
            continue;
        }

        const { st, ed, tr } = element;

        if ((isApply || isApplied) && textStart > ed) {
            moveElementCharIndex(element, length);
        }

        if (tr == null) {
            continue;
        }
        if (textStart < st || textStart > ed || isApplied) {
            continue;
        }

        console.log(
            'paragraphApply',
            textStart,
            st,
            ed,
            isApplied,
            element,
            textStart < st || textStart > ed || isApplied
        );

        if (paragraphElementType === ParagraphElementType.TEXT_RUN) {
            let relative = textStart - st + 1;

            if (start === 0) {
                relative = 0;
            }

            isApply = true;

            if (tr.tab === BooleanNumber.TRUE) {
                continue;
            }

            const newContent = insertTextToContent(tr.ct || '', relative, text);

            tr.ct = newContent;

            element.ed += length;
        }
    }

    if (isApply === true && isApplied === false) {
        blockElement.ed += length;
    }

    if (isApplied) {
        return true;
    }

    return isApply;
}
