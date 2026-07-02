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

import type { IDisposable } from '@univerjs/core';
import type { IEmbedPassiveViewportWheelContext, IEmbedPassiveWheelHandlerContribution } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';

export class EmbedPassiveWheelHandlerRegistryService {
    private readonly _handlers: IEmbedPassiveWheelHandlerContribution[] = [];

    register(handler: IEmbedPassiveWheelHandlerContribution): IDisposable {
        this._handlers.push(handler);
        this._sortHandlers();

        return toDisposable(() => {
            const index = this._handlers.indexOf(handler);
            if (index >= 0) {
                this._handlers.splice(index, 1);
            }
        });
    }

    handleWheel(context: IEmbedPassiveViewportWheelContext): boolean {
        for (const handler of this._handlers) {
            if (handler.childType !== context.childType) {
                continue;
            }
            if (context.layout && handler.supportedLayouts?.length && !handler.supportedLayouts.includes(context.layout)) {
                continue;
            }
            if (handler.handleWheel(context) === true) {
                return true;
            }
        }

        return false;
    }

    list(): IEmbedPassiveWheelHandlerContribution[] {
        return [...this._handlers];
    }

    private _sortHandlers(): void {
        this._handlers.sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
    }
}
