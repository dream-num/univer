import { IDocActionData } from '../../Command/DocActionBase';
import { IDocumentBody } from '../../Interfaces/IDocumentData';
import { Nullable } from '../../Shared';
import { UpdateDocsAttributeType } from '../../Shared/CommandEnum';

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
}

export interface IInsertActionData extends IDocActionData {
    body: IDocumentBody;
    len: number;
    line: number;
    segmentId?: string; //The ID of the header, footer or footnote the location is in. An empty segment ID signifies the document's body.
}

export interface IRetainActionData extends IDocActionData {
    body: Nullable<IDocumentBody>;
    len: number;
    coverType: UpdateDocsAttributeType;
    segmentId?: string;
}

export interface IUpdateDocumentActionData extends IDocActionData {
    text: string;
}
