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
    const { st, ed } = blockElement;

    const { cursorStart, isStartBack, segmentId } = collapseRange;

    const textStart = getTextIndexByCursor(cursorStart, isStartBack);

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

            if (textStart === 0) {
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
