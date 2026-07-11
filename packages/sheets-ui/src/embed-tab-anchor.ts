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

const EMBED_SHEETS_TAB_CUSTOM_KEY = 'UNIVER_EMBED_SHEETS_TAB';

interface IEmbedSheetsTabCustomData {
    version: 1;
    embedId: string;
    hostAnchorId: string;
}

export function getEmbedSheetsTabCustomData(snapshot: Pick<IWorksheetData, 'custom'>): IEmbedSheetsTabCustomData | undefined {
    const value = snapshot.custom?.[EMBED_SHEETS_TAB_CUSTOM_KEY];
    if (!isEmbedSheetsTabCustomData(value)) {
        return undefined;
    }

    return value;
}

function isEmbedSheetsTabCustomData(value: unknown): value is IEmbedSheetsTabCustomData {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<IEmbedSheetsTabCustomData>;
    return candidate.version === 1 &&
        typeof candidate.embedId === 'string' &&
        typeof candidate.hostAnchorId === 'string';
}
