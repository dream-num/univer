import { BooleanNumber } from '../../Enum/TextStyle';
import {
    BlockType,
    IBlockElement,
    IParagraph,
    ParagraphElementType,
} from '../../Interfaces/IDocumentData';
import { ITextSelectionRangeParam } from '../../Interfaces/ISelectionData';
import { DocumentModel } from '../Domain/DocumentModel';
import { deleteContent, getDocsUpdateBody, getTextIndexByCursor } from './Common';

export function DeleteTextApply(
    document: DocumentModel,
    range: ITextSelectionRangeParam
) {
    const doc = document.getSnapshot();

    const { segmentId } = range;

    const body = getDocsUpdateBody(doc, segmentId);

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
                if (blockElement.paragraph) {
                    deleteText(blockElement, blockElement.paragraph, range);
                }
        }
    }
}

function deleteText(
    blockElement: IBlockElement,
    paragraph: IParagraph,
    range: ITextSelectionRangeParam
) {
    const { cursorStart, cursorEnd, isStartBack, isEndBack, isCollapse } = range;

    const textStart = getTextIndexByCursor(cursorStart, isStartBack);

    const textEnd = getTextIndexByCursor(cursorEnd, isEndBack);

    const { st, ed } = blockElement;

    if (cursorStart > ed || cursorEnd < st) {
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

        if (paragraphElementType === ParagraphElementType.TEXT_RUN) {
            let relative = textStart - st + 1;

            if (textStart === 0) {
                relative = 0;
            }

            if (tr.tab === BooleanNumber.TRUE) {
                continue;
            }

            const newContent = deleteContent(tr.ct || '', relative, length);

            tr.ct = newContent;
        }
    }
}
