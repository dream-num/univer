import {
    CommandType,
    CommonParameter,
    DeleteApply,
    ICurrentUniverService,
    IDocumentBody,
    IMutation,
    InsertApply,
    UpdateAttributeApply,
    UpdateDocsAttributeType,
} from '@univerjs/core';

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

export interface IRichTextEditingMutationParams {
    unitId: string;
    mutations: Array<IRetainMutationParams | IInsertMutationParams | IDeleteMutationParams>;
}

export const RichTextEditingMutation: IMutation<IRichTextEditingMutationParams> = {
    id: 'doc.mutation.rich-text-editing',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const { unitId, mutations } = params;
        const currentUniverService = accessor.get(ICurrentUniverService);

        const document = currentUniverService.getUniverDocInstance(unitId)?.getDocument();
        if (!document) {
            throw new Error(`Document not found for unitId: ${unitId}`);
        }

        const commonParameter = new CommonParameter();
        commonParameter.reset();
        mutations.forEach((mutation) => {
            if (mutation.t === 'r') {
                const { coverType, body, len, segmentId } = mutation;
                UpdateAttributeApply(document, body, len, commonParameter.cursor, coverType, segmentId);
                commonParameter.moveCursor(len);
            } else if (mutation.t === 'i') {
                const { body, len, segmentId } = mutation;
                InsertApply(document, body!, len, commonParameter.cursor, segmentId);
                commonParameter.moveCursor(len);
            } else if (mutation.t === 'd') {
                const { len, segmentId } = mutation;
                DeleteApply(document, len, commonParameter.cursor, segmentId);
            } else {
                throw new Error(`Unknown mutation type for mutation: ${mutation}.`);
            }
        });

        return true;
    },
};
