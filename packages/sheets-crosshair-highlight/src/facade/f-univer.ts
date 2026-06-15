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

import type { Injector } from '@univerjs/core';
import type { ICrosshairHighlightEnabledChangedEventParams } from './f-event';
import { ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SheetsCrosshairHighlightService,
    ToggleCrosshairHighlightOperation,
} from '@univerjs/sheets-crosshair-highlight';

/**
 * @ignore
 */
export interface IFUniverSheetsCrosshairHighlightMixin {
    /**
     * Enable or disable crosshair highlight.
     * @param {boolean} enabled - Whether to enable the crosshair highlight
     * @returns {FUniver} The FUniver instance for chaining
     * @example
     * ```ts
     * univerAPI.setCrosshairHighlightEnabled(true);
     * ```
     */
    setCrosshairHighlightEnabled(enabled: boolean): FUniver;

    /**
     * Get whether the crosshair highlight is enabled.
     * @returns {boolean} Whether the crosshair highlight is enabled
     * @example
     * ```ts
     * console.log(univerAPI.getCrosshairHighlightEnabled());
     * ```
     */
    getCrosshairHighlightEnabled(): boolean;
}

/**
 * @ignore
 */
export class FUniverSheetsCrosshairHighlightMixin extends FUniver implements IFUniverSheetsCrosshairHighlightMixin {
    /**
     * @ignore
     */
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.CrosshairHighlightEnabledChanged,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (
                        commandInfo.id === EnableCrosshairHighlightOperation.id ||
                    commandInfo.id === DisableCrosshairHighlightOperation.id ||
                    commandInfo.id === ToggleCrosshairHighlightOperation.id
                    ) {
                        const activeSheet = this.getActiveSheet();
                        if (!activeSheet) return;
                        const eventParams: ICrosshairHighlightEnabledChangedEventParams = {
                            enabled: this.getCrosshairHighlightEnabled(),
                            ...activeSheet,
                        };
                        this.fireEvent(this.Event.CrosshairHighlightEnabledChanged, eventParams);
                    }
                })
            )
        );
    }

    override setCrosshairHighlightEnabled(enabled: boolean): FUniver {
        if (enabled) {
            this._commandService.syncExecuteCommand(EnableCrosshairHighlightOperation.id);
        } else {
            this._commandService.syncExecuteCommand(DisableCrosshairHighlightOperation.id);
        }

        return this;
    }

    override getCrosshairHighlightEnabled(): boolean {
        const crosshairHighlightService = this._injector.get(SheetsCrosshairHighlightService);
        return crosshairHighlightService.enabled;
    }
}

FUniver.extend(FUniverSheetsCrosshairHighlightMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsCrosshairHighlightMixin { }
}
