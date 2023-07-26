import { getDocsUpdateBody } from '../../Shared/Common';
import { DocumentModel } from '../Model/DocumentModel';

export function UpdateDocumentApply(documentModel: DocumentModel, textLength: number, currentIndex: number, segmentId?: string) {
    const doc = documentModel.getSnapshot();

    const bodyModel = documentModel.getBodyModel(segmentId);

    const body = getDocsUpdateBody(doc, segmentId);

    if (textLength === 0) {
        return;
    }

    if (body == null) {
        throw new Error('no body has changed');
    }
}
