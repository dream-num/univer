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

import type {
    DocumentDataModel,
    ICustomRange,
    IDocStructureIssue,
    IDocumentBody,
    IDocumentData,
    ISdtCustomRange,
    JSONXActions,
    JSONXPath,
} from '@univerjs/core';
import {
    CustomRangeType,
    DataStreamTreeTokenType,
    getRichTextEditPath,
    getSdtBindingKey,
    getSdtBindingValue,
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

function getLockedSdtContent(body: IDocumentBody, range: ICustomRange): string {
    if (range.properties?.kind !== 'group') {
        return body.dataStream.slice(range.startIndex, range.endIndex + 1);
    }
    // A Word group protects text outside its child controls. Each child retains
    // its own lock policy; keep its identity here so deleting it is not an edit.
    const children = (body.customRanges ?? []).filter((child) =>
        child.rangeType === CustomRangeType.SDT && child.rangeId !== range.rangeId &&
        child.startIndex >= range.startIndex && child.endIndex <= range.endIndex
    ).sort((left, right) => {
        const position = left.startIndex - right.startIndex || right.endIndex - left.endIndex;
        if (position || left.rangeId === right.rangeId) {
            return position;
        }
        return left.rangeId < right.rangeId ? -1 : 1;
    });
    const protectedContent: string[] = [];
    let offset = range.startIndex;
    for (const child of children) {
        if (child.startIndex < offset) {
            continue;
        }
        protectedContent.push(body.dataStream.slice(offset, child.startIndex), child.rangeId);
        offset = child.endIndex + 1;
    }
    protectedContent.push(body.dataStream.slice(offset, range.endIndex + 1));
    return JSON.stringify(protectedContent);
}

function getRepeatingItemIds(body: IDocumentBody, section: ICustomRange): string[] {
    const ranges = body.customRanges ?? [];
    const sectionIndex = ranges.indexOf(section);
    const nestedSections = ranges.filter((range, index) => range.rangeType === CustomRangeType.SDT &&
        range.properties?.kind === 'repeatingSection' && range.rangeId !== section.rangeId &&
        range.startIndex >= section.startIndex && range.endIndex <= section.endIndex &&
        (range.startIndex > section.startIndex || range.endIndex < section.endIndex || index < sectionIndex));
    return ranges.filter((range, index) => range.rangeType === CustomRangeType.SDT &&
        range.properties?.kind === 'repeatingSectionItem' &&
        range.startIndex >= section.startIndex && range.endIndex <= section.endIndex &&
        !nestedSections.some((nested) => nested.startIndex <= range.startIndex && range.endIndex <= nested.endIndex &&
            (nested.startIndex < range.startIndex || range.endIndex < nested.endIndex || index < ranges.indexOf(nested))))
        .map((range) => range.rangeId)
        .sort();
}

export function isDocSdtMutationAllowed(documentDataModel: DocumentDataModel, segmentId: string, actions: JSONXActions): boolean {
    if (!containsTextXEdit(actions) && isStructurePreservingJSONXEdit(actions, getRichTextEditPath(documentDataModel, segmentId))) {
        return true;
    }
    const snapshot = documentDataModel.getSnapshot();
    const previousBody = getSnapshotBody(snapshot, segmentId);
    const lockedRanges = previousBody?.customRanges?.filter((range) =>
        range.rangeType === CustomRangeType.SDT && (
            (range.properties?.lock && range.properties.lock !== 'unlocked') ||
            (range.properties?.kind === 'repeatingSection' && range.properties.repeatingSection?.doNotAllowInsertDelete)
        )
    );
    if (!previousBody || !lockedRanges?.length) {
        return true;
    }
    // Preview before applying: an inverse TextX edit can merge imported runs,
    // so rolling back a rejected keystroke is not an exact no-op.
    const candidate = JSONX.apply(Tools.deepClone(snapshot), actions) as unknown as IDocumentData;
    const currentBody = getSnapshotBody(candidate, segmentId);

    for (const previous of lockedRanges) {
        const lock = previous.properties?.lock;
        const current = currentBody?.customRanges?.find((range) => range.rangeId === previous.rangeId && range.rangeType === CustomRangeType.SDT);
        const wrapperLocked = lock === 'sdtLocked' || lock === 'sdtContentLocked';
        const contentLocked = lock === 'contentLocked' || lock === 'sdtContentLocked';
        if (wrapperLocked && !current) {
            return false;
        }
        if (previous.properties?.kind === 'repeatingSection' && previous.properties.repeatingSection?.doNotAllowInsertDelete &&
            current && currentBody) {
            const before = getRepeatingItemIds(previousBody, previous);
            const after = getRepeatingItemIds(currentBody, current);
            if (before.length !== after.length || before.some((id, index) => id !== after[index])) {
                return false;
            }
        }
        // Word allows deleting a contentLocked control as a whole, but not changing its contents.
        if (contentLocked && current && currentBody) {
            const before = getLockedSdtContent(previousBody, previous);
            const after = getLockedSdtContent(currentBody, current);
            // Content locking protects the value, not the control's developer properties.
            // Word still lets the author change or clear the lock from Content Control Properties.
            if (before !== after && !isBoundSdtValueUpdate(snapshot, candidate, previous as ISdtCustomRange, current as ISdtCustomRange, currentBody)) {
                return false;
            }
        }
    }
    return true;
}

function isBoundSdtValueUpdate(
    before: IDocumentData,
    after: IDocumentData,
    previous: ISdtCustomRange,
    current: ISdtCustomRange,
    currentBody: IDocumentBody
): boolean {
    const key = getSdtBindingKey(previous);
    const value = getSdtBindingValue(currentBody, current);
    if (!key || key !== getSdtBindingKey(current) || value === undefined) {
        return false;
    }
    const segments = ['', ...Object.keys(before.headers ?? {}), ...Object.keys(before.footers ?? {}), ...Object.keys(before.notes ?? {})];
    return segments.some((segmentId) => {
        const previousBody = getSnapshotBody(before, segmentId);
        const nextBody = getSnapshotBody(after, segmentId);
        if (!previousBody || !nextBody) {
            return false;
        }
        return previousBody.customRanges?.some((range) => {
            if (range.rangeType !== CustomRangeType.SDT || range.properties?.lock === 'contentLocked' ||
                range.properties?.lock === 'sdtContentLocked' || getSdtBindingKey(range as ISdtCustomRange) !== key) {
                return false;
            }
            const next = nextBody.customRanges?.find((item) => item.rangeType === CustomRangeType.SDT && item.rangeId === range.rangeId);
            // Word updates locked mirrors through the shared XML node, but a direct
            // edit of the locked control alone must still be rejected.
            return next != null && getSdtBindingKey(next as ISdtCustomRange) === key &&
                getSdtBindingValue(previousBody, range as ISdtCustomRange) !== value &&
                getSdtBindingValue(nextBody, next as ISdtCustomRange) === value;
        }) ?? false;
    });
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

    let changesFootnoteStructure = false;
    const cursor = JSON1.type.readCursor(actions);
    cursor.traverse(null, (component) => {
        const path = cursor.getPath();
        if ((path[0] === 'notes' && (path.length <= 2 || path[2] !== 'body')) || path.includes('customRanges')) {
            changesFootnoteStructure = true;
        }
        if (component.et === TextX.id && Array.isArray(component.e)) {
            for (const action of component.e) {
                if (isRecord(action) && Array.isArray(action.rangeUpdates) && action.rangeUpdates.some((update) =>
                    isRecord(update) && isRecord(update.range) &&
                    (update.range.rangeType === CustomRangeType.FOOTNOTE || update.range.rangeType === CustomRangeType.ENDNOTE))) {
                    changesFootnoteStructure = true;
                }
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
