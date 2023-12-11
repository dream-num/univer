/**
 * Copyright 2023 DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
