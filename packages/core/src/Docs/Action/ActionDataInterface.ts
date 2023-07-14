import { IDocActionData } from '../../Command/DocActionBase';
import {
    CommonParameterAttribute,
    IDocumentBody,
} from '../../Interfaces/IDocumentData';

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
    attribute?: CommonParameterAttribute;
    len: number;
    segmentId?: string;
}

export interface IUpdateDocumentActionData extends IDocActionData {
    text: string;
}
