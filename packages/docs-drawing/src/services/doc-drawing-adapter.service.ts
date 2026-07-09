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

import type { IDisposable, IMutationInfo } from '@univerjs/core';
import type { IDocDrawing } from './doc-drawing.service';
import { createIdentifier, toDisposable } from '@univerjs/core';

export interface IDocDrawingRemoveMutationInfoParams {
    unitId: string;
    subUnitId: string;
    drawing: IDocDrawing;
    removeDrawings: readonly IDocDrawing[];
}

export interface IDocDrawingEditCommandInfoParams {
    unitId: string;
    subUnitId: string;
    drawing: IDocDrawing;
}

export interface IDocDrawingMutationInfos {
    redoMutations: IMutationInfo[];
    undoMutations: IMutationInfo[];
}

export interface IDocDrawingEditCommandInfo {
    label?: string;
    commandId: string;
    commandParams?: unknown;
    disable?: boolean;
}

export interface IDocDrawingAdapter {
    getRemoveDrawingMutationInfos?: (
        params: IDocDrawingRemoveMutationInfoParams
    ) => IDocDrawingMutationInfos | null | undefined;
    getEditDrawingCommandInfo?: (
        params: IDocDrawingEditCommandInfoParams
    ) => IDocDrawingEditCommandInfo | null | undefined;
}

export interface IDocDrawingAdapterService {
    registerAdapter(adapter: IDocDrawingAdapter): IDisposable;
    getRemoveDrawingMutationInfos(params: IDocDrawingRemoveMutationInfoParams): IDocDrawingMutationInfos;
    getEditDrawingCommandInfo(params: IDocDrawingEditCommandInfoParams): IDocDrawingEditCommandInfo | null;
}

export const IDocDrawingAdapterService = createIdentifier<IDocDrawingAdapterService>('doc.drawing-adapter.service');

export class DocDrawingAdapterService implements IDocDrawingAdapterService {
    private readonly _adapters: IDocDrawingAdapter[] = [];

    registerAdapter(adapter: IDocDrawingAdapter): IDisposable {
        this._adapters.push(adapter);

        return toDisposable(() => {
            const index = this._adapters.indexOf(adapter);
            if (index >= 0) {
                this._adapters.splice(index, 1);
            }
        });
    }

    getRemoveDrawingMutationInfos(params: IDocDrawingRemoveMutationInfoParams): IDocDrawingMutationInfos {
        const mutationInfos: IDocDrawingMutationInfos = {
            redoMutations: [],
            undoMutations: [],
        };

        for (const adapter of this._adapters) {
            const nextMutationInfos = adapter.getRemoveDrawingMutationInfos?.(params);
            if (!nextMutationInfos) {
                continue;
            }

            mutationInfos.redoMutations.push(...nextMutationInfos.redoMutations);
            mutationInfos.undoMutations.push(...nextMutationInfos.undoMutations);
        }

        return mutationInfos;
    }

    getEditDrawingCommandInfo(params: IDocDrawingEditCommandInfoParams): IDocDrawingEditCommandInfo | null {
        for (const adapter of this._adapters) {
            const commandInfo = adapter.getEditDrawingCommandInfo?.(params);
            if (commandInfo) {
                return commandInfo;
            }
        }

        return null;
    }
}
