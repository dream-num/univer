import { CommandType, ICommand } from "@univerjs/core";

export interface ICommentUpdateOperationProps {
    threadId: string;
    commentId: string;
    unitId: string;
    subUnitId: string;
    rootId: string;
    type: 'update' | 'delete' | 'reply' | 'colla'
}

export const CommentUpdateOperation: ICommand<ICommentUpdateOperationProps> = {
    type: CommandType.OPERATION,
    id: 'thread-comment.operation.comment-update',
    handler() {
        return true;
    },
}
