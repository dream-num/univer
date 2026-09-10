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

import type { DocumentDataModel, IDocStructureIssue, IDocumentBody, IDocumentData, JSONXActions, JSONXPath } from '@univerjs/core';
import {
    CustomRangeType,
    DataStreamTreeTokenType,

    getRichTextEditPath,

    JSON1,
    JSONX,

    TextX,
    TextXActionType,
    Tools,
    validateDocBodyStructure,
    validateDocumentStructure,
} from '@univerjs/core';

const STRUCTURAL_BODY_FIELDS = [
    'paragraphs',
    'sectionBreaks',
    'customBlocks',
    'docxRawCustomBlocks',
    'docxRawBlocks',
    'docxExportExcludedRanges',
    'tables',
    'columnGroups',
    'blockRanges',
] satisfies Array<keyof IDocumentBody>;
const STRUCTURAL_DATA_STREAM_TOKENS = new Set<string>([
    DataStreamTreeTokenType.PARAGRAPH,
    DataStreamTreeTokenType.SECTION_BREAK,
    DataStreamTreeTokenType.TABLE_START,
    DataStreamTreeTokenType.TABLE_ROW_START,
    DataStreamTreeTokenType.TABLE_CELL_START,
    DataStreamTreeTokenType.TABLE_CELL_END,
    DataStreamTreeTokenType.TABLE_ROW_END,
    DataStreamTreeTokenType.TABLE_END,
    DataStreamTreeTokenType.COLUMN_GROUP_START,
    DataStreamTreeTokenType.COLUMN_START,
    DataStreamTreeTokenType.COLUMN_END,
    DataStreamTreeTokenType.COLUMN_GROUP_END,
    DataStreamTreeTokenType.BLOCK_START,
    DataStreamTreeTokenType.BLOCK_END,
    DataStreamTreeTokenType.CUSTOM_BLOCK,
]);
const NON_STRUCTURAL_ROOT_FIELDS = new Set<string>([
    'disabled',
    'documentStyle',
    'drawings',
    'drawingsOrder',
    'lists',
    'locale',
    'resources',
    'rev',
    'settings',
    'styles',
    'tableSource',
    'title',
]);
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value != null && !Array.isArray(value);
}

function containsStructuralToken(dataStream: string): boolean {
    for (let index = 0; index < dataStream.length; index++) {
        if (STRUCTURAL_DATA_STREAM_TOKENS.has(dataStream[index])) {
            return true;
        }
    }

    return false;
}

function isStructurePreservingBody(value: unknown): boolean {
    if (!isRecord(value)) {
        return false;
    }

    const dataStream = value.dataStream;
    if (dataStream != null && (typeof dataStream !== 'string' || containsStructuralToken(dataStream))) {
        return false;
    }

    return STRUCTURAL_BODY_FIELDS.every((field) => {
        const metadata = value[field];
        return metadata == null || (Array.isArray(metadata) && metadata.length === 0);
    });
}

function isStructurePreservingTextXEdit(value: unknown): boolean {
    if (!Array.isArray(value)) {
        return false;
    }

    return value.every((action) => {
        if (!isRecord(action) || typeof action.len !== 'number' || !Number.isFinite(action.len)) {
            return false;
        }

        if (action.t === TextXActionType.DELETE) {
            return true;
        }

        if (action.t === TextXActionType.INSERT) {
            return isStructurePreservingBody(action.body);
        }

        return action.t === TextXActionType.RETAIN &&
            (action.body == null || isStructurePreservingBody(action.body));
    });
}

function pathsEqual(left: JSONXPath, right: JSONXPath): boolean {
    return left.length === right.length && left.every((item, index) => item === right[index]);
}

function isStructurePreservingJSONXEdit(actions: JSONXActions, expectedPath: JSONXPath): boolean {
    const cursor = JSON1.type.readCursor(actions);
    let hasComponent = false;
    let isStructurePreserving = true;

    cursor.traverse(null, (component) => {
        if (!isStructurePreserving) {
            return;
        }

        const path = cursor.getPath();
        hasComponent = true;
        if (NON_STRUCTURAL_ROOT_FIELDS.has(String(path[0]))) {
            return;
        }

        const componentKeys = Object.keys(component);
        if (component.et !== TextX.id || componentKeys.some((key) => key !== 'et' && key !== 'e') || !pathsEqual(path, expectedPath)) {
            isStructurePreserving = false;
            return;
        }

        const edit: unknown = component.e;
        isStructurePreserving = isStructurePreservingTextXEdit(edit);
    });

    return hasComponent && isStructurePreserving;
}

function getSegmentType(documentDataModel: DocumentDataModel, segmentId: string): 'body' | 'header' | 'footer' | 'note' {
    if (!segmentId) {
        return 'body';
    }

    const { headers, footers } = documentDataModel.getSnapshot();
    if (headers?.[segmentId]) {
        return 'header';
    }

    if (footers?.[segmentId]) {
        return 'footer';
    }

    if (documentDataModel.getSnapshot().notes?.[segmentId]) {
        return 'note';
    }

    return 'body';
}

function getSnapshotBody(snapshot: IDocumentData, segmentId: string): IDocumentBody | undefined {
    if (!segmentId) {
        return snapshot.body;
    }
    return snapshot.headers?.[segmentId]?.body ?? snapshot.footers?.[segmentId]?.body ?? snapshot.notes?.[segmentId]?.body;
}

function containsTextXEdit(actions: JSONXActions): boolean {
    const cursor = JSON1.type.readCursor(actions);
    let found = false;
    cursor.traverse(null, (component) => {
        if (component.et === TextX.id) found = true;
    });
    return found;
}

function subtractBaselineIssues(issues: IDocStructureIssue[], baseline: IDocStructureIssue[]): IDocStructureIssue[] {
    const counts = new Map<string, number>();
    baseline.forEach((issue) => counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1));
    return issues.filter((issue) => {
        const count = counts.get(issue.code) ?? 0;
        if (count === 0) {
            return true;
        }
        counts.set(issue.code, count - 1);
        return false;
    });
}

function assertValidDocBodyStructure(documentDataModel: DocumentDataModel, segmentId: string, undoActions: JSONXActions): void {
    const segmentModel = documentDataModel.getSelfOrHeaderFooterModel(segmentId);
    const body = segmentModel?.getBody();
    if (!body) {
        return;
    }

    const segmentType = getSegmentType(documentDataModel, segmentId);
    const context = { segmentType, segmentId: segmentId || undefined };
    const note = documentDataModel.getSnapshot().notes?.[segmentId];
    const issues = note
        ? validateDocumentStructure({ notes: { [segmentId]: note } })
        : validateDocBodyStructure(body, { segmentType, segmentId: segmentId || undefined });
    if (!issues.length) {
        return;
    }

    const snapshot = Tools.deepClone(documentDataModel.getSnapshot());
    const restoredSnapshot = JSONX.apply(snapshot, undoActions) as unknown as IDocumentData;
    const baselineBody = getSnapshotBody(restoredSnapshot, segmentId);
    // ponytail: issue counts preserve editability for legacy imports; add offset-aware mapping if two
    // defects of the same kind can be exchanged by one mutation in production.
    const newIssues = baselineBody
        ? subtractBaselineIssues(issues, validateDocBodyStructure(baselineBody, context))
        : issues;
    if (!newIssues.length) {
        return;
    }

    const detail = newIssues.map((issue) => `${issue.code}${issue.index == null ? '' : `@${issue.index}`}`).join(', ');
    const segmentLabel = segmentId ? `${segmentType} ${segmentId}` : segmentType;
    throw new Error(`[DocStructure] ${segmentLabel}: ${detail}`);
}

function containsLockedSdt(value: unknown): boolean {
    if (Array.isArray(value)) {
        return value.some(containsLockedSdt);
    }
    if (!isRecord(value)) {
        return false;
    }
    return (value.rangeType === CustomRangeType.SDT && isRecord(value.properties) &&
        typeof value.properties.lock === 'string' && value.properties.lock !== 'unlocked') ||
        Object.values(value).some(containsLockedSdt);
}

function assertSdtLocks(documentDataModel: DocumentDataModel, segmentId: string, undoActions: JSONXActions): void {
    const currentBody = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
    if (!currentBody) return;
    const snapshot = Tools.deepClone(documentDataModel.getSnapshot());
    const restoredSnapshot = JSONX.apply(snapshot, undoActions) as unknown as IDocumentData;
    const previousBody = getSnapshotBody(restoredSnapshot, segmentId);
    if (!previousBody) return;

    for (const previous of previousBody.customRanges ?? []) {
        if (previous.rangeType !== CustomRangeType.SDT) continue;
        const lock = previous.properties?.lock;
        if (!lock || lock === 'unlocked') continue;
        const current = currentBody.customRanges?.find((range) => range.rangeId === previous.rangeId && range.rangeType === CustomRangeType.SDT);
        const wrapperLocked = lock === 'sdtLocked' || lock === 'sdtContentLocked';
        const contentLocked = lock === 'contentLocked' || lock === 'sdtContentLocked';
        if (wrapperLocked && !current) {
            throw new Error(`[DocSDT] ${previous.rangeId}: wrapper is locked`);
        }
        // Word allows deleting a contentLocked control as a whole, but not changing its contents.
        if (contentLocked && current) {
            const before = previousBody.dataStream.slice(previous.startIndex, previous.endIndex + 1);
            const after = currentBody.dataStream.slice(current.startIndex, current.endIndex + 1);
            // Content locking protects the value, not the control's developer properties.
            // Word still lets the author change or clear the lock from Content Control Properties.
            if (before !== after) {
                throw new Error(`[DocSDT] ${previous.rangeId}: content is locked`);
            }
        }
    }
}

export function validateDocStructureMutation(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    actions: JSONXActions,
    undoActions: JSONXActions,
    isHistoryReplay = false
): boolean {
    const editPath = getRichTextEditPath(documentDataModel, segmentId);
    const preservesStructure =
        isStructurePreservingJSONXEdit(actions, editPath) &&
        isStructurePreservingJSONXEdit(undoActions, editPath);

    if (!isHistoryReplay) {
        const hasCurrentLock = containsTextXEdit(actions) && documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customRanges?.some((range) => range.rangeType === CustomRangeType.SDT && range.properties?.lock && range.properties.lock !== 'unlocked');
        if (hasCurrentLock || (!preservesStructure && containsLockedSdt(undoActions))) {
            assertSdtLocks(documentDataModel, segmentId, undoActions);
        }
    }

    let changesFootnoteStructure = false;
    const cursor = JSON1.type.readCursor(actions);
    cursor.traverse(null, (component) => {
        const path = cursor.getPath();
        if ((path[0] === 'notes' && (path.length <= 2 || path[2] !== 'body')) || path.includes('customRanges')) {
            changesFootnoteStructure = true;
        }
        if (component.et === TextX.id && Array.isArray(component.e)) {
            for (const action of component.e) {
                const ranges: unknown = isRecord(action) && isRecord(action.body) ? action.body.customRanges : undefined;
                if (Array.isArray(ranges) && ranges.some((range) => isRecord(range) && (range.rangeType === CustomRangeType.FOOTNOTE || range.rangeType === CustomRangeType.ENDNOTE))) {
                    changesFootnoteStructure = true;
                }
            }
        }
    });
    if (changesFootnoteStructure) {
        const issues = validateDocumentStructure(documentDataModel.getSnapshot());
        if (issues.length > 0) {
            throw new Error(`[DocStructure] ${issues.map((issue) => `${issue.code}@${issue.index ?? issue.segmentId ?? ''}`).join(', ')}`);
        }
    } else if (!preservesStructure && !isHistoryReplay) {
        assertValidDocBodyStructure(documentDataModel, segmentId, undoActions);
    }
    return preservesStructure && !changesFootnoteStructure;
}
