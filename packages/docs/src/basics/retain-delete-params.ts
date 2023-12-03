import type { IDeleteMutationParams, IRetainMutationParams, ITextRange } from '@univerjs/core';

export function getRetainAndDeleteFromReplace(
    range: ITextRange,
    segmentId: string = '',
    memoryCursor: number = 0
): Array<IRetainMutationParams | IDeleteMutationParams> {
    const { startOffset, endOffset } = range;
    const dos: Array<IRetainMutationParams | IDeleteMutationParams> = [];

    const textStart = startOffset - memoryCursor;
    const textEnd = endOffset - memoryCursor;

    if (textStart > 0) {
        dos.push({
            t: 'r',
            len: textStart,
            segmentId,
        });
    }

    dos.push({
        t: 'd',
        len: textEnd - textStart,
        line: 0,
        segmentId,
    });

    return dos;
}
