import {
    BlockType,
    IBlockElement,
    IElement,
    IParagraph,
    ParagraphElementType,
} from '../../Interfaces/IDocumentData';
import { ITextSelectionRangeParam } from '../../Interfaces/ISelectionData';
import { Nullable } from '../../Shared';
import { DocumentModel } from '../Domain/DocumentModel';
import {
    getDocsUpdateBody,
    moveBlockCharIndex,
    moveElementCharIndex,
} from './Common';

export function textIndexAdjustApply(
    document: DocumentModel,
    range: ITextSelectionRangeParam
) {
    const { segmentId } = range;

    const doc = document.getSnapshot();
    let body = getDocsUpdateBody(doc, segmentId);

    if (body == null) {
        throw new Error('no body has changed');
    }

    const { blockElements } = body;

    let preParagraphBlockElement: Nullable<IBlockElement> = null;

    for (let blockElement of blockElements) {
        if (blockElement == null) {
            continue;
        }

        const { blockType } = blockElement;

        switch (blockType) {
            case BlockType.PARAGRAPH:
                if (blockElement.paragraph) {
                    paragraphIndexAdjust(
                        blockElement,
                        blockElement.paragraph,
                        range,
                        preParagraphBlockElement
                    );
                }
                preParagraphBlockElement = blockElement;
        }
    }
}

function paragraphIndexAdjust(
    blockElement: IBlockElement,
    paragraph: IParagraph,
    range: ITextSelectionRangeParam,
    preBlockElement: Nullable<IBlockElement>
) {
    const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = range;

    const { st: blockStart, ed: blockEnd } = blockElement;

    if (cursorStart > blockEnd) {
        return;
    }

    const { elements } = paragraph;

    const preBlockEnd = preBlockElement ? preBlockElement.ed : -1;

    if (cursorEnd < blockStart) {
        const moveIndex = preBlockEnd - blockStart + 1;

        moveBlockCharIndex(blockElement, moveIndex);

        _iteratorElement(elements, (element) => {
            moveElementCharIndex(element, moveIndex);
        });
    } else {
        let curStart = preBlockEnd + 1;
        let preElementStart = curStart;
        _iteratorElement(elements, (element) => {
            const { tr: textRun } = element;

            const content = textRun?.ct || '';

            element.st = preElementStart;
            element.ed = preElementStart + content.length - 1;

            preElementStart = element.ed + 1;
        });

        blockElement.st = curStart;
        blockElement.ed = preElementStart - 1;
    }
}

function _iteratorElement(
    elements: IElement[],
    callback: (element: IElement) => void
) {
    for (let element of elements) {
        const { et: paragraphElementType } = element;
        if (paragraphElementType === ParagraphElementType.DRAWING) {
            continue;
        }

        callback(element);
    }
}
