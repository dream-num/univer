import { BooleanNumber } from '../../Enum/TextStyle';
import {
    BlockType,
    IParagraph,
    ParagraphElementType,
} from '../../Interfaces/IDocumentData';
import { DocumentModel } from '../Domain/DocumentModel';
import {
    deleteContent,
    getTextStartByAnchor,
    moveBlockCharIndex,
    moveElementCharIndex,
} from './Common';

export function DeleteTextApply(
    document: DocumentModel,
    config: { start: number; length: number; segmentId?: string }
) {
    const doc = document.getSnapshot();
    const { start, length, segmentId } = config;

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

        const { st, ed, blockType } = blockElement;

        if (isApplied) {
            switch (blockType) {
                case BlockType.PARAGRAPH:
                    moveBlockCharIndex(blockElement, -length);
                    break;
            }
            continue;
        }

        if (textStart < st || textStart > ed) {
            continue;
        }

        switch (blockType) {
            case BlockType.PARAGRAPH:
                isApplied = paragraphApply(
                    start,
                    textStart,
                    length,
                    blockElement.paragraph
                );
                blockElement.ed -= length;
                break;
        }
    }
}

function paragraphApply(
    start: number,
    textStart: number,
    length: number,
    paragraph?: IParagraph
) {
    let isApply = false;

    if (paragraph == null) {
        return isApply;
    }

    const { elements, elementOrder } = paragraph;

    for (let elementInfo of elementOrder) {
        const { elementId, paragraphElementType } = elementInfo;
        const element = elements[elementId];

        const { st, ed, tr } = element;

        if (isApply) {
            moveElementCharIndex(element, -length);
        }

        if (textStart < st || textStart > ed) {
            continue;
        }

        if (tr == null) {
            continue;
        }

        if (paragraphElementType === ParagraphElementType.TEXT_RUN) {
            let relative = textStart - st + 1;

            if (start === 0) {
                relative = 0;
            }

            isApply = true;

            if (tr.tab === BooleanNumber.TRUE) {
                continue;
            }

            const newContent = deleteContent(tr.ct || '', relative, length);

            tr.ct = newContent;

            element.ed += length;
        }
    }

    return isApply;
}
