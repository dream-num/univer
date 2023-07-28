import { IDocActionData } from '../../Command/DocActionBase';
import { IDocumentBody } from './IDocumentData';
import { UpdateDocsAttributeType } from '../../Shared/CommandEnum';
import { Nullable } from '../../Shared/Types';

export enum UpdateAttributeType {
    TEXT_RUN,
    PARAGRAPH,
    SECTION,
    CUSTOM_BLOCK,
    TABLE,
    CUSTOM_RANGE,
}
export interface IDeleteActionData extends IDocActionData {
    len: number;
    line: number;
    segmentId?: string;
    cursor: number;
}

export interface IInsertActionData extends IDocActionData {
    body: IDocumentBody;
    len: number;
    line: number;
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
    cursor: number;
}

export interface IRetainActionData extends IDocActionData {
    body: Nullable<IDocumentBody>;
    len: number;
    coverType: UpdateDocsAttributeType;
    segmentId?: string;
    cursor: number;
}

export interface IUpdateDocumentActionData extends IDocActionData {
    text: string;
}
