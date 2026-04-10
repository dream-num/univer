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
import type { ISetCrosshairHighlightColorOperationParams } from '@univerjs/sheets-crosshair-highlight';
import type { ICrosshairHighlightColorChangedEventParams, ICrosshairHighlightEnabledChangedEventParams } from './f-event';
import { ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    CROSSHAIR_HIGHLIGHT_COLORS,
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SetCrosshairHighlightColorOperation,
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
     * Set the color of the crosshair highlight.
     * @param {string} color - The color of the crosshair highlight, if the color not has alpha channel, the alpha channel will be set to 0.5
     * @returns {FUniver} The FUniver instance for chaining
     * @example
     * ```ts
     * univerAPI.setCrosshairHighlightColor('#FF0000');
     * // or
     * univerAPI.setCrosshairHighlightColor('rgba(232, 11, 11, 0.2)');
     * ```
     */
    setCrosshairHighlightColor(color: string): FUniver;

    /**
     * Get whether the crosshair highlight is enabled.
     * @returns {boolean} Whether the crosshair highlight is enabled
     * @example
     * ```ts
     * console.log(univerAPI.getCrosshairHighlightEnabled());
     * ```
     */
    getCrosshairHighlightEnabled(): boolean;

    /**
     * Get the color of the crosshair highlight.
     * @returns {string} The color of the crosshair highlight
     * @example
     * ```ts
     * console.log(univerAPI.getCrosshairHighlightColor());
     * ```
     */
    getCrosshairHighlightColor(): string;

    /**
     * Get the available built-in colors for the crosshair highlight.
     */
    readonly CROSSHAIR_HIGHLIGHT_COLORS: string[];
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

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.CrosshairHighlightColorChanged,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetCrosshairHighlightColorOperation.id) {
                        const activeSheet = this.getActiveSheet();
                        if (!activeSheet) return;
                        const eventParams: ICrosshairHighlightColorChangedEventParams = {
                            color: this.getCrosshairHighlightColor(),
                            ...activeSheet,
                        };
                        this.fireEvent(this.Event.CrosshairHighlightColorChanged, eventParams);
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

    override setCrosshairHighlightColor(color: string): FUniver {
        this._commandService.syncExecuteCommand(SetCrosshairHighlightColorOperation.id, {
            value: color,
        } as ISetCrosshairHighlightColorOperationParams);
        return this;
    }

    override getCrosshairHighlightEnabled(): boolean {
        const crosshairHighlightService = this._injector.get(SheetsCrosshairHighlightService);
        return crosshairHighlightService.enabled;
    }

    override getCrosshairHighlightColor(): string {
        const crosshairHighlightService = this._injector.get(SheetsCrosshairHighlightService);
        return crosshairHighlightService.color;
    }

    override get CROSSHAIR_HIGHLIGHT_COLORS(): string[] {
        return CROSSHAIR_HIGHLIGHT_COLORS;
    }
}

FUniver.extend(FUniverSheetsCrosshairHighlightMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsCrosshairHighlightMixin { }
}
