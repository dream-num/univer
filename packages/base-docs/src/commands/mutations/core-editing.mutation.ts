import { CommandType, type DocMutationParams, IMutation, IUniverInstanceService } from '@univerjs/core';

export interface IRichTextEditingMutationParams {
    unitId: string;
    mutations: DocMutationParams[];
}

/**
 * The core mutator to change rich text mutations. The execution result would be undo mutation params. Could be directly
 * send to undo redo service (will be used by the triggering command).
 */
export const RichTextEditingMutation: IMutation<IRichTextEditingMutationParams, IRichTextEditingMutationParams> = {
    id: 'doc.mutation.rich-text-editing',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, mutations } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const documentModel = univerInstanceService.getUniverDocInstance(unitId);

        if (!documentModel) {
            throw new Error(`DocumentModel not found for unitId: ${unitId}`);
        }

        const undoMutations = documentModel.apply(mutations);

        return {
            unitId,
            mutations: undoMutations,
        };
    },
};
