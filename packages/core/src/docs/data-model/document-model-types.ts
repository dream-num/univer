import { UpdateDocsAttributeType } from '../../shared/command-enum';
import { IDocumentBody } from '../../types/interfaces/i-document-data';

/**
 * Retain mutation is used to move the cursor or to update properties of the text in the given range.
 */
export interface IRetainMutationParams {
    t: 'r';
    len: number;
    segmentId?: string;
    body?: IDocumentBody;
    coverType?: UpdateDocsAttributeType;
}

/**
 * Insert mutation is used to insert text (maybe with rich text properties) at the given position.
 */
export interface IInsertMutationParams {
    t: 'i';
    body: IDocumentBody;
    len: number;
    line: number;
    segmentId?: string;
}

/**
 * Delete mutation is used to delete text at the given position.
 */
export interface IDeleteMutationParams {
    t: 'd';
    line: number;
    len: number;
    segmentId?: string;
}

export type DocMutationParams = IRetainMutationParams | IInsertMutationParams | IDeleteMutationParams;
