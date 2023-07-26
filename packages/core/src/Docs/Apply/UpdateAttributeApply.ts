import { UpdateDocsAttributeType } from '../../Shared/CommandEnum';
import { getDocsUpdateBody, horizontalLineSegmentsSubtraction } from '../../Shared/Common';
import { IRetainActionData } from '../../Types/Interfaces/IDocActionInterfaces';
import { IDocumentBody } from '../../Types/Interfaces/IDocumentData';
import { DocumentModel } from '../Model/DocumentModel';

export function UpdateAttributeApply(documentModel: DocumentModel, data: IRetainActionData) {
    const { len: textLength, body: updateBody, cursor: currentIndex, coverType, segmentId } = data;

    if (updateBody == null) {
        return;
    }

    const doc = documentModel.getSnapshot();

    const body = getDocsUpdateBody(doc, segmentId);

    if (body == null) {
        throw new Error('no body has changed');
    }

    return updateAttribute(body, updateBody, textLength, currentIndex, coverType);
}

function updateAttribute(body: IDocumentBody, updateBody: IDocumentBody, textLength: number, currentIndex: number, coverType: UpdateDocsAttributeType): IDocumentBody {
    const removeTextRuns = updateTextRuns(body, updateBody, textLength, currentIndex, coverType);

    return {
        dataStream: '',
        textRuns: removeTextRuns,
        // paragraphs: removeParagraphs,
        // sectionBreaks: removeSectionBreaks,
        // customBlocks: removeCustomBlocks,
        // tables: removeTables,
        // customRanges: removeCustomRanges,
    };
}

function updateTextRuns(body: IDocumentBody, updateBody: IDocumentBody, textLength: number, currentIndex: number, coverType: UpdateDocsAttributeType) {
    const { textRuns } = body;

    const { textRuns: updateTextRuns } = updateBody;

    if (textRuns == null || updateTextRuns == null) {
        return;
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
