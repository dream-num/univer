import {
    IBlockElement,
    IDocumentData,
    IElement,
} from '../../Interfaces/IDocumentData';

export function getTextStartByAnchor(start: number) {
    let textStart = start - 1;

    textStart = textStart < 0 ? 0 : textStart;

    return textStart;
}

export function insertTextToContent(content: string, start: number, text: string) {
    return content.slice(0, start) + text + content.slice(start);
}

export function deleteContent(content: string, start: number, length: number) {
    const startDeleteIndex = start - length < 0 ? 0 : start - length;
    return content.slice(0, startDeleteIndex) + content.slice(start);
}

export function moveElementCharIndex(element?: IElement, moveIndex: number = 0) {
    if (element == null) {
        return;
    }

    element.st += moveIndex;
    element.ed += moveIndex;
}

export function moveBlockCharIndex(
    blockElement?: IBlockElement,
    moveIndex: number = 0
) {
    if (blockElement == null) {
        return;
    }

    blockElement.st += moveIndex;
    blockElement.ed += moveIndex;
}

export function getDocsUpdateBody(model: IDocumentData, segmentId?: string) {
    let body = model.body;

    if (segmentId) {
        const { headers, footers } = model;
        if (headers?.[segmentId]) {
            body = headers[segmentId].body;
        } else if (footers?.[segmentId]) {
            body = footers[segmentId].body;
        }
    }

    return body;
}
