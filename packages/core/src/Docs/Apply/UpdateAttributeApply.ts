import { UpdateAttributeValueType, IDocumentBody, ITextRun } from '../../Interfaces/IDocumentData';
import { DocumentModel } from '../Domain/DocumentModel';
import { getDocsUpdateBody, horizontalLineSegmentsSubtraction } from '../../Shared/Common';
import { UpdateDocsAttributeType } from '../../Shared/CommandEnum';
import { UpdateAttributeType } from '../Action/ActionDataInterface';

export function UpdateAttributeApply(
    document: DocumentModel,
    textLength: number,
    currentIndex: number,
    attributes: UpdateAttributeValueType[],
    attributeType: UpdateAttributeType,
    coverType: UpdateDocsAttributeType,
    segmentId?: string
) {
    const doc = document.snapshot;

    const body = getDocsUpdateBody(doc, segmentId);

    if (textLength === 0) {
        return [];
    }

    if (body == null) {
        throw new Error('no body has changed');
    }

    return updateAttribute(body, textLength, currentIndex, attributes, attributeType, coverType);
}

function updateAttribute(
    body: IDocumentBody,
    textLength: number,
    currentIndex: number,
    attributes: UpdateAttributeValueType[],
    attributeType: UpdateAttributeType,
    coverType: UpdateDocsAttributeType
) {
    if (attributeType === UpdateAttributeType.TEXT_RUN) {
        return processTextRuns(body, textLength, currentIndex, attributes as ITextRun[], coverType);
    }

    return [];
}

function processTextRuns(body: IDocumentBody, textLength: number, currentIndex: number, updateTextRuns: ITextRun[], coverType: UpdateDocsAttributeType) {
    const { textRuns } = body;

    if (textRuns == null) {
        return [];
    }

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;

    const removeTextRuns = [];
    for (let i = 0, len = textRuns.length; i < len; i++) {
        const textRun = textRuns[i];
        const { st, ed } = textRun;

        if (startIndex <= st && endIndex >= ed) {
            removeTextRuns.push({
                ...textRun,
                st: st - currentIndex,
                ed: ed - currentIndex,
            });

            for (let updateTextRun of updateTextRuns) {
                const { st: updateSt, ed: updateEd } = updateTextRun;
            }

            continue;
        } else if (st <= startIndex && ed >= endIndex) {
            const segments = horizontalLineSegmentsSubtraction(st, ed, startIndex, endIndex);

            if (segments.length > 2) {
                const seg1 = segments[0];
                const seg2 = segments[1];
                textRun.st = seg1[0];
                textRun.ed = seg1[1] + seg2[1] - seg2[0] + 1;
            } else {
                textRun.st = segments[0][0];
                textRun.ed = segments[0][1];
            }
        } else if (startIndex >= st && startIndex <= ed) {
            removeTextRuns.push({
                ...textRun,
                st: startIndex - currentIndex,
                ed: ed - currentIndex,
            });
            textRun.ed = startIndex - 1;
        } else if (endIndex >= st && endIndex <= ed) {
            removeTextRuns.push({
                ...textRun,
                st: st - currentIndex,
                ed: endIndex - currentIndex,
            });
            textRun.st = endIndex + 1;
        } else if (st > endIndex) {
            textRun.st -= textLength;
            textRun.ed -= textLength;
        }
    }

    return removeTextRuns;
}
