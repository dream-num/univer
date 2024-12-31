/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ISetCrosshairHighlightColorOperationParams } from '@univerjs/sheets-crosshair-highlight';
import { FUniver } from '@univerjs/core';
import { DisableCrosshairHighlightOperation, EnableCrosshairHighlightOperation, SetCrosshairHighlightColorOperation } from '@univerjs/sheets-crosshair-highlight';

export interface IFUniverCrosshairHighlightMixin {
    /**
     * Enable or disable crosshair highlight.
     * @param {boolean} enabled if crosshair highlight should be enabled
     */
    setCrosshairHighlightEnabled(enabled: boolean): FUniver;

    /**
     * Set the color of the crosshair highlight.
     * @param {string} color the color of the crosshair highlight
     */
    setCrosshairHighlightColor(color: string): FUniver;
}

export class FUniverCrosshairHighlightMixin extends FUniver implements IFUniverCrosshairHighlightMixin {
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
}

FUniver.extend(FUniverCrosshairHighlightMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverCrosshairHighlightMixin {}
}
