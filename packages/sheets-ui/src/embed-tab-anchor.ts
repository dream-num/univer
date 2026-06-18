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

import type { IWorksheetData } from '@univerjs/core';
import type { EmbedDescriptor } from '@univerjs/embed';
import { BooleanNumber } from '@univerjs/core';

export const EMBED_SHEETS_TAB_CUSTOM_KEY = 'UNIVER_EMBED_SHEETS_TAB';

export interface EmbedSheetsTabCustomData {
    version: 1;
    embedId: string;
    hostAnchorId: string;
}

export interface EmbedSheetsTabSnapshotParams {
    embedId: string;
    hostAnchorId: string;
    name?: string;
}

export function createEmbedSheetsTabSnapshot(params: EmbedSheetsTabSnapshotParams): IWorksheetData {
    return {
        id: params.hostAnchorId,
        name: params.name ?? params.embedId,
        tabColor: '',
        hidden: BooleanNumber.FALSE,
        rowCount: 1,
        columnCount: 1,
        zoomRatio: 1,
        freeze: {
            startRow: -1,
            startColumn: -1,
            ySplit: 0,
            xSplit: 0,
        },
        scrollTop: 0,
        scrollLeft: 0,
        defaultColumnWidth: 88,
        defaultRowHeight: 24,
        mergeData: [],
        cellData: {},
        rowData: {},
        columnData: {},
        showGridlines: BooleanNumber.FALSE,
        rowHeader: {
            width: 46,
            hidden: BooleanNumber.TRUE,
        },
        columnHeader: {
            height: 20,
            hidden: BooleanNumber.TRUE,
        },
        rightToLeft: BooleanNumber.FALSE,
        custom: {
            [EMBED_SHEETS_TAB_CUSTOM_KEY]: createEmbedSheetsTabCustomData(params),
        },
    };
}

export function createEmbedSheetsTabCustomData(params: EmbedSheetsTabSnapshotParams): EmbedSheetsTabCustomData {
    return {
        version: 1,
        embedId: params.embedId,
        hostAnchorId: params.hostAnchorId,
    };
}

export function createEmbedSheetsTabSnapshotFromDescriptor(descriptor: EmbedDescriptor, name?: string): IWorksheetData {
    return createEmbedSheetsTabSnapshot({
        embedId: descriptor.embedId,
        hostAnchorId: descriptor.hostAnchorId,
        name,
    });
}

export function getEmbedSheetsTabCustomData(snapshot: Pick<IWorksheetData, 'custom'>): EmbedSheetsTabCustomData | undefined {
    const value = snapshot.custom?.[EMBED_SHEETS_TAB_CUSTOM_KEY];
    if (!isEmbedSheetsTabCustomData(value)) {
        return undefined;
    }

    return value;
}

export function isEmbedSheetsTabSnapshot(snapshot: Pick<IWorksheetData, 'custom'>): boolean {
    return getEmbedSheetsTabCustomData(snapshot) != null;
}

function isEmbedSheetsTabCustomData(value: unknown): value is EmbedSheetsTabCustomData {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<EmbedSheetsTabCustomData>;
    return candidate.version === 1 &&
        typeof candidate.embedId === 'string' &&
        typeof candidate.hostAnchorId === 'string';
}
