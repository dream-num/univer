import { CommandType, ICommand } from "@univerjs/core";

export interface CommentUpdateOperation {
    threadId: string;
    commentId: string;
    unitId: string;
    subUnitId: string;
}

export const CommentUpdateOperation: ICommand<CommentUpdateOperation> = {
    type: CommandType.OPERATION,
    id: 'thread-comment.operation.comment-update',
    handler() {
        return true;
    },
}
