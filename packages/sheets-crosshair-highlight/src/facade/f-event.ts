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

import type { IEventBase } from '@univerjs/core/facade';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName } from '@univerjs/core/facade';

export interface IFSheetsCrosshairHighlightEventNameMixin {
    /**
     * Triggered when the crosshair highlight is enabled or disabled.
     * @see {@link ICrosshairHighlightEnabledChangedEventParams}
     * @example
     * ```ts
     * const disposable = univerAPI.addEvent(univerAPI.Event.CrosshairHighlightEnabledChanged, (params) => {
     *   const { enabled, workbook, worksheet } = params;
     *   console.log(params);
     * });
     *
     * // Remove the event listener, use `disposable.dispose()`
     * ```
     */
    readonly CrosshairHighlightEnabledChanged: 'CrosshairHighlightEnabledChanged';
}

/**
 * @ignore
 */
export class FSheetsCrosshairHighlightEventNameMixin extends FEventName implements IFSheetsCrosshairHighlightEventNameMixin {
    override get CrosshairHighlightEnabledChanged(): 'CrosshairHighlightEnabledChanged' {
        return 'CrosshairHighlightEnabledChanged';
    }
}

export interface ICrosshairHighlightEnabledChangedEventParams extends IEventBase {
    /**
     * Whether the crosshair highlight is enabled.
     */
    enabled: boolean;
    /**
     * The workbook that the crosshair highlight is enabled in.
     */
    workbook: FWorkbook;
    /**
     * The worksheet that the crosshair highlight is enabled in.
     */
    worksheet: FWorksheet;
}

/**
 * @ignore
 */
export interface ISheetsCrosshairHighlightEventParamConfig {
    CrosshairHighlightEnabledChanged: ICrosshairHighlightEnabledChangedEventParams;
}

FEventName.extend(FSheetsCrosshairHighlightEventNameMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsCrosshairHighlightEventNameMixin { }

    interface IEventParamConfig extends ISheetsCrosshairHighlightEventParamConfig { }
}
