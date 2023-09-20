import { CommandType, ICurrentUniverService, IDocumentBody, IMutation, UpdateDocsAttributeType } from '@univerjs/core';

import { DeleteApply } from './functions/delete-apply';
import { InsertApply } from './functions/insert';
import { UpdateAttributeApply } from './functions/update';

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

/**
 * The core mutator to change rich text mutations. The execution result would be undo mutation params. Could be directly
 * send to undo redo service (will be used by the triggering command).
 */
export const RichTextEditingMutation: IMutation<IRichTextEditingMutationParams, IRichTextEditingMutationParams> = {
    id: 'doc.mutation.rich-text-editing',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const { unitId, mutations } = params;
        const currentUniverService = accessor.get(ICurrentUniverService);

        const document = currentUniverService.getUniverDocInstance(unitId)?.getDocument();
        if (!document) {
            throw new Error(`Document not found for unitId: ${unitId}`);
        }

        const undoMutations: Array<IRetainMutationParams | IInsertMutationParams | IDeleteMutationParams> = [];
        const commonParameter = new CommonParameter();
        commonParameter.reset();
        mutations.forEach((mutation) => {
            if (mutation.t === 'r') {
                const { coverType, body, len, segmentId } = mutation;
                const documentBody = UpdateAttributeApply(
                    document,
                    body,
                    len,
                    commonParameter.cursor,
                    coverType,
                    segmentId
                );
                commonParameter.moveCursor(len);
                undoMutations.push({
                    ...mutation,
                    t: 'r',
                    coverType: UpdateDocsAttributeType.REPLACE,
                    body: documentBody,
                });
            } else if (mutation.t === 'i') {
                const { body, len, segmentId, line } = mutation;
                InsertApply(document, body!, len, commonParameter.cursor, segmentId);
                commonParameter.moveCursor(len);
                undoMutations.push({
                    t: 'd',
                    len,
                    line,
                    segmentId,
                });
            } else if (mutation.t === 'd') {
                const { len, segmentId } = mutation;
                const documentBody = DeleteApply(document, len, commonParameter.cursor, segmentId);
                undoMutations.push({
                    ...mutation,
                    t: 'i',
                    body: documentBody,
                });
            } else {
                throw new Error(`Unknown mutation type for mutation: ${mutation}.`);
            }
        });

        return {
            unitId,
            mutations: undoMutations,
        };
    },
};

class CommonParameter {
    cursor: number;

    reset() {
        this.cursor = 0;
        return this;
    }

    moveCursor(pos: number) {
        this.cursor += pos;
    }
}
