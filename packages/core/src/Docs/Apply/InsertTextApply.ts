import { BooleanNumber } from '../../Enum/TextStyle';
import {
    BlockType,
    IBlockElement,
    IParagraph,
    ParagraphElementType,
} from '../../Interfaces/IDocumentData';
import { DocumentModel } from '../Domain/DocumentModel';
import {
    getDocsUpdateBody,
    getTextStartByAnchor,
    insertTextToContent,
} from './Common';

export function InsertTextApply(
    document: DocumentModel,
    config: { text: string; start: number; length: number; segmentId?: string }
) {
    const doc = document.getSnapshot();
    const { text, start, length, segmentId } = config;

    const textStart = getTextStartByAnchor(start);

    const body = getDocsUpdateBody(doc, segmentId);

    if (length === 0) {
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
                paragraphApply(
                    text,
                    start,
                    textStart,
                    blockElement,
                    blockElement.paragraph
                );
        }
    }
}

function paragraphApply(
    text: string,
    start: number,
    textStart: number,
    blockElement: IBlockElement,
    paragraph?: IParagraph
) {
    const { st, ed } = blockElement;

    if (textStart > ed || paragraph == null) {
        return;
    }

    const { elements } = paragraph;

    for (let element of elements) {
        const { et: paragraphElementType } = element;

        if (paragraphElementType === ParagraphElementType.DRAWING) {
            continue;
        }

        const { st, ed, tr } = element;

        if (tr == null) {
            continue;
        }
        if (textStart < st || textStart > ed) {
            continue;
        }

        console.log(
            'paragraphApply',
            textStart,
            st,
            ed,
            element,
            textStart < st || textStart > ed
        );

        if (paragraphElementType === ParagraphElementType.TEXT_RUN) {
            let relative = textStart - st + 1;

            if (start === 0) {
                relative = 0;
            }

            if (tr.tab === BooleanNumber.TRUE) {
                continue;
            }

            const newContent = insertTextToContent(tr.ct || '', relative, text);

            tr.ct = newContent;
        }
    }
}
