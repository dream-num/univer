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

import type { ICustomRange, IDocumentBody } from '@univerjs/core';
import { CustomRangeType } from '@univerjs/core';
import type { IDocumentSkeletonPage } from '../../../basics/i-document-skeleton-cached';
import { GlyphType } from '../../../basics/i-document-skeleton-cached';

/** Maps ordinary shaped field text back to the shared editable story, including empty caches. */
export function getHeaderFooterReferenceOffsetMap(original: IDocumentBody, projected: IDocumentBody): number[] | undefined {
    const ranges = (original.customRanges ?? []).filter((range) => range.rangeType === CustomRangeType.FIELD).sort((left, right) => left.startIndex - right.startIndex || right.endIndex - left.endIndex);
    const fields: ICustomRange[] = [];
    const parents: ICustomRange[] = [];
    const children = new Map<ICustomRange, ICustomRange[]>();
    for (const field of ranges) {
        while (parents.length && parents[parents.length - 1].endIndex <= field.startIndex) {
            parents.pop();
        }
        const parent = parents[parents.length - 1];
        if (parent) {
            if (field.startIndex <= parent.startIndex || field.endIndex >= parent.endIndex) {
                return undefined;
            }
            const nested = children.get(parent) ?? [];
            nested.push(field);
            children.set(parent, nested);
        } else {
            fields.push(field);
        }
        parents.push(field);
    }
    const targets = new Map((projected.customRanges ?? []).filter((range) => range.rangeType === CustomRangeType.FIELD).map((range) => [range.rangeId, range]));
    const offsets: number[] = [];
    const mapFields = (nested: ICustomRange[], sourceStart: number, sourceEnd: number, targetStart: number, targetEnd: number, depth: number): boolean => {
        if (depth > 32) {
            return false;
        }
        let source = sourceStart;
        let destination = targetStart;
        for (const field of nested) {
            const target = targets.get(field.rangeId);
            if (!target || target.startIndex < destination || target.endIndex < target.startIndex + 1 ||
                target.endIndex >= targetEnd || field.endIndex >= sourceEnd ||
                field.startIndex < source || field.endIndex < field.startIndex + 1 ||
                original.dataStream.slice(source, field.startIndex + 1) !== projected.dataStream.slice(destination, target.startIndex + 1)) {
                return false;
            }
            for (let index = destination; index <= target.startIndex; index++) {
                offsets[index] = source + index - destination;
            }
            // Keep literal directory text precise when only a nested field result changes.
            if (!mapFields(children.get(field) ?? [], field.startIndex + 1, field.endIndex, target.startIndex + 1, target.endIndex, depth + 1)) {
                const before = field.endIndex - field.startIndex - 1;
                const after = target.endIndex - target.startIndex - 1;
                for (let index = 0; index <= after; index++) {
                    offsets[target.startIndex + 1 + index] = after ? field.startIndex + 1 + Math.floor(index * before / after) : field.endIndex;
                }
            }
            source = field.endIndex;
            destination = target.endIndex;
        }
        if (original.dataStream.slice(source, sourceEnd) !== projected.dataStream.slice(destination, targetEnd)) {
            return false;
        }
        for (let index = destination; index <= targetEnd; index++) {
            offsets[index] = source + index - destination;
        }
        return true;
    };
    return mapFields(fields, 0, original.dataStream.length, 0, projected.dataStream.length, 0) ? offsets : undefined;
}

export function remapHeaderFooterReferenceSkeleton(page: IDocumentSkeletonPage, original: IDocumentBody, projected: IDocumentBody, offsets: readonly number[]): void {
    const mapRange = (range: { st: number; ed: number }): void => {
        const start = range.st;
        const end = range.ed;
        range.st = offsets[start];
        range.ed = Math.max(range.st - 1, offsets[end + 1] - 1);
    };
    for (const section of page.sections) {
        for (const column of section.columns) {
            for (const line of column.lines) {
                const paragraph = projected.paragraphs?.find((paragraph) => paragraph.startIndex === line.paragraphIndex);
                const previous = paragraph && original.paragraphs?.find((candidate) => candidate.paragraphId === paragraph.paragraphId);
                line.paragraphIndex = previous?.startIndex ?? original.paragraphs?.find((paragraph) => paragraph.startIndex >= offsets[line.paragraphIndex])?.startIndex ?? offsets[line.paragraphIndex];
                for (const divide of line.divides) {
                    let index = divide.st;
                    for (const glyph of divide.glyphGroup) {
                        if (glyph.glyphType !== GlyphType.LIST) {
                            const end = index + glyph.count;
                            const count = glyph.count;
                            glyph.count = offsets[end] - offsets[index];
                            if (count > 0 && glyph.count === 0) {
                                glyph.referenceSourceBoundary = true;
                            }
                            index = end;
                        }
                    }
                    mapRange(divide);
                }
                mapRange(line);
            }
            mapRange(column);
        }
        mapRange(section);
    }
    for (const table of page.skeTables.values()) {
        for (const row of table.rows) {
            for (const cell of row.cells) {
                remapHeaderFooterReferenceSkeleton(cell, original, projected, offsets);
            }
            mapRange(row);
        }
        mapRange(table);
    }
    for (const group of page.skeColumnGroups?.values() ?? []) {
        for (const column of group.columns) {
            remapHeaderFooterReferenceSkeleton(column.page, original, projected, offsets);
            mapRange(column);
        }
        mapRange(group);
    }
    mapRange(page);
}
