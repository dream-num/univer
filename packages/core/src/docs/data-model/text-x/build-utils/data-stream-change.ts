/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IDocumentBody } from '../../../../types/interfaces';

export interface IDataStreamChange {
    start: number;
    deleteLength: number;
    insertLength: number;
}

/**
 * Finds one contiguous dataStream change. Pure structural insertions are
 * anchored by their new stable ids before falling back to string comparison.
 * This prevents an adjacent identical sentinel from being mistaken for an
 * unchanged prefix and keeps the inserted structure metadata in the TextX body.
 */
export function getSingleDataStreamChange(
    previousBody: IDocumentBody | undefined,
    nextBody: IDocumentBody | undefined
): IDataStreamChange | null {
    if (previousBody == null || nextBody == null) {
        return null;
    }

    const previousDataStream = previousBody.dataStream;
    const nextDataStream = nextBody.dataStream;
    if (previousDataStream === nextDataStream) {
        return null;
    }

    const insertedLength = nextDataStream.length - previousDataStream.length;
    if (insertedLength > 0) {
        const structuralInsertion = findStructuralInsertion(
            previousBody,
            nextBody,
            previousDataStream,
            nextDataStream,
            insertedLength
        );
        if (structuralInsertion) {
            return structuralInsertion;
        }
    }

    let start = 0;
    while (
        start < previousDataStream.length &&
        start < nextDataStream.length &&
        previousDataStream[start] === nextDataStream[start]
    ) {
        start++;
    }

    let previousEnd = previousDataStream.length;
    let nextEnd = nextDataStream.length;
    while (
        previousEnd > start &&
        nextEnd > start &&
        previousDataStream[previousEnd - 1] === nextDataStream[nextEnd - 1]
    ) {
        previousEnd--;
        nextEnd--;
    }

    return {
        start,
        deleteLength: previousEnd - start,
        insertLength: nextEnd - start,
    };
}

function findStructuralInsertion(
    previousBody: IDocumentBody,
    nextBody: IDocumentBody,
    previousDataStream: string,
    nextDataStream: string,
    insertedLength: number
): IDataStreamChange | null {
    for (const start of collectNewStructuralStartOffsets(previousBody, nextBody)) {
        if (
            previousDataStream.slice(0, start) === nextDataStream.slice(0, start) &&
            previousDataStream.slice(start) === nextDataStream.slice(start + insertedLength)
        ) {
            return { start, deleteLength: 0, insertLength: insertedLength };
        }
    }

    return null;
}

function collectNewStructuralStartOffsets(previousBody: IDocumentBody, nextBody: IDocumentBody): number[] {
    const offsets = [
        ...collectNewStartOffsets(previousBody.blockRanges, nextBody.blockRanges, (item) => item.blockId),
        ...collectNewStartOffsets(previousBody.tables, nextBody.tables, (item) => item.tableId),
        ...collectNewStartOffsets(previousBody.columnGroups, nextBody.columnGroups, (item) => item.columnGroupId),
        ...collectNewStartOffsets(previousBody.customBlocks, nextBody.customBlocks, (item) => item.blockId),
    ];

    return Array.from(new Set(offsets)).sort((left, right) => left - right);
}

function collectNewStartOffsets<T extends { startIndex: number }>(
    previousItems: T[] | undefined,
    nextItems: T[] | undefined,
    getId: (item: T) => string
): number[] {
    const previousIds = new Set((previousItems ?? []).map(getId));
    return (nextItems ?? [])
        .filter((item) => !previousIds.has(getId(item)))
        .map((item) => item.startIndex);
}
