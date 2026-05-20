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

import type { IDisposable, IRange, Workbook, Worksheet } from '@univerjs/core';

export enum HeaderUnhideRangeAxis {
    ROW = 'row',
    COLUMN = 'column',
}

export interface IHeaderUnhideRangeVisibleCheck {
    axis: HeaderUnhideRangeAxis;
    range: IRange;
    workbook: Workbook;
    worksheet: Worksheet;
}

export type HeaderUnhideRangeVisibleHandler = (
    visible: boolean,
    payload: IHeaderUnhideRangeVisibleCheck
) => boolean;

export class HeaderUnhideRangeService {
    private readonly _visibleHandlers = new Set<HeaderUnhideRangeVisibleHandler>();

    registerRangeVisibleHandler(handler: HeaderUnhideRangeVisibleHandler): IDisposable {
        this._visibleHandlers.add(handler);
        const dispose = () => this._visibleHandlers.delete(handler);

        return {
            dispose,
            unsubscribe: dispose,
        } as IDisposable;
    }

    shouldRenderRange(visible: boolean, payload: IHeaderUnhideRangeVisibleCheck): boolean {
        let nextVisible = visible;
        for (const handler of this._visibleHandlers) {
            nextVisible = handler(nextVisible, payload);
        }

        return nextVisible;
    }
}
