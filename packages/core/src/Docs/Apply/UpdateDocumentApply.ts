import { DocumentModel } from '../Domain/DocumentModel';
import { getDocsUpdateBody } from '../../Shared/Common';

export function UpdateDocumentApply(document: DocumentModel, textLength: number, currentIndex: number, segmentId?: string) {
    const doc = document.snapshot;

    const bodyModel = document.getBodyModel(segmentId);

    const body = getDocsUpdateBody(doc, segmentId);

    if (textLength === 0) {
        return;
    }

    if (body == null) {
        throw new Error('no body has changed');
    }
}
