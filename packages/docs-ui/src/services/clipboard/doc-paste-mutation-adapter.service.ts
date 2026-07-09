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

import type { IDisposable, IDocumentBody, IDocumentData, IDrawingParam, IMutationInfo } from '@univerjs/core';
import { createIdentifier, toDisposable } from '@univerjs/core';

export interface IDocClipboardPasteCustomBlockMapping {
    sourceBlockId: string;
    targetBlockId: string;
    sourceDrawing: IDrawingParam;
    targetDrawing: IDrawingParam;
}

export interface IDocClipboardPasteMutationInfoParams {
    unitId: string;
    segmentId: string;
    doc: Partial<IDocumentData>;
    sourceBody: IDocumentBody;
    targetBody: IDocumentBody;
    customBlockMappings: IDocClipboardPasteCustomBlockMapping[];
}

export interface IDocClipboardPasteMutationInfos {
    redoMutations: IMutationInfo[];
    undoMutations: IMutationInfo[];
}

export interface IDocClipboardPasteAdapter {
    getPasteMutationInfos?: (
        params: IDocClipboardPasteMutationInfoParams
    ) => IDocClipboardPasteMutationInfos | null | undefined;
}

export interface IDocClipboardPasteAdapterService {
    registerAdapter(adapter: IDocClipboardPasteAdapter): IDisposable;
    getPasteMutationInfos(params: IDocClipboardPasteMutationInfoParams): IDocClipboardPasteMutationInfos;
}

export const IDocClipboardPasteAdapterService = createIdentifier<IDocClipboardPasteAdapterService>('doc.clipboard-paste-adapter.service');

export class DocClipboardPasteAdapterService implements IDocClipboardPasteAdapterService {
    private readonly _adapters: IDocClipboardPasteAdapter[] = [];

    registerAdapter(adapter: IDocClipboardPasteAdapter): IDisposable {
        this._adapters.push(adapter);

        return toDisposable(() => {
            const index = this._adapters.indexOf(adapter);
            if (index >= 0) {
                this._adapters.splice(index, 1);
            }
        });
    }

    getPasteMutationInfos(params: IDocClipboardPasteMutationInfoParams): IDocClipboardPasteMutationInfos {
        const mutationInfos: IDocClipboardPasteMutationInfos = {
            redoMutations: [],
            undoMutations: [],
        };

        for (const adapter of this._adapters) {
            const nextMutationInfos = adapter.getPasteMutationInfos?.(params);
            if (!nextMutationInfos) {
                continue;
            }

            mutationInfos.redoMutations.push(...nextMutationInfos.redoMutations);
            mutationInfos.undoMutations.push(...nextMutationInfos.undoMutations);
        }

        return mutationInfos;
    }
}
