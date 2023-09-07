import { getDocsUpdateBody } from '../../Shared/Common';
import { insertTextToContent } from '../../Shared/DocTool';
import { IDocumentBody } from '../../Types/Interfaces/IDocumentData';
import { DocumentModel } from '../Domain/DocumentModel';
import { insertCustomBlocks, insertCustomRanges, insertParagraphs, insertSectionBreaks, insertTables, insertTextRuns } from './Common';

export function InsertApply(document: DocumentModel, insertBody: IDocumentBody, textLength: number, currentIndex: number, segmentId?: string) {
    const doc = document.snapshot;

    const bodyModel = document.getBodyModel(segmentId);

    const body = getDocsUpdateBody(doc, segmentId);

    if (textLength === 0) {
        return;
    }

    if (body == null) {
        throw new Error('no body has changed');
    }

    bodyModel.insert(insertBody, currentIndex);

    updateAttributeByInsert(body, insertBody, textLength, currentIndex);

    console.log('插入的model打印', bodyModel, body, textLength);
}

function updateAttributeByInsert(body: IDocumentBody, insertBody: IDocumentBody, textLength: number, currentIndex: number) {
    body.dataStream = insertTextToContent(body.dataStream, currentIndex, insertBody.dataStream);

    insertTextRuns(body, insertBody, textLength, currentIndex);

    insertParagraphs(body, insertBody, textLength, currentIndex);

    insertSectionBreaks(body, insertBody, textLength, currentIndex);

    insertCustomBlocks(body, insertBody, textLength, currentIndex);

    insertTables(body, insertBody, textLength, currentIndex);

    insertCustomRanges(body, insertBody, textLength, currentIndex);
}
