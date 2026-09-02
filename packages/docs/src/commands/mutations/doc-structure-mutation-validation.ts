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

import type { DocumentDataModel, IDocumentBody, JSONXActions, JSONXPath } from '@univerjs/core';
import {
    DataStreamTreeTokenType,

    getRichTextEditPath,

    JSON1,

    TextX,
    TextXActionType,
    validateDocBodyStructure,
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

function getSegmentType(documentDataModel: DocumentDataModel, segmentId: string): 'body' | 'header' | 'footer' {
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

    return 'body';
}

function assertValidDocBodyStructure(documentDataModel: DocumentDataModel, segmentId: string): void {
    const segmentModel = documentDataModel.getSelfOrHeaderFooterModel(segmentId);
    const body = segmentModel?.getBody();
    if (!body) {
        return;
    }

    const segmentType = getSegmentType(documentDataModel, segmentId);
    const issues = validateDocBodyStructure(body, { segmentType, segmentId: segmentId || undefined });
    if (!issues.length) {
        return;
    }

    const detail = issues.map((issue) => `${issue.code}${issue.index == null ? '' : `@${issue.index}`}`).join(', ');
    const segmentLabel = segmentId ? `${segmentType} ${segmentId}` : segmentType;
    throw new Error(`[DocStructure] ${segmentLabel}: ${detail}`);
}

export function validateDocStructureMutation(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    actions: JSONXActions,
    undoActions: JSONXActions
): boolean {
    const editPath = getRichTextEditPath(documentDataModel, segmentId);
    const preservesStructure =
        isStructurePreservingJSONXEdit(actions, editPath) &&
        isStructurePreservingJSONXEdit(undoActions, editPath);

    if (!preservesStructure) {
        assertValidDocBodyStructure(documentDataModel, segmentId);
    }
    return preservesStructure;
}
