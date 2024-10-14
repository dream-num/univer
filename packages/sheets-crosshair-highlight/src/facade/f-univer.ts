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

import type { ISetCrosshairHighlightColorOperationParams } from '../commands/operations/operation';
import { FUniver } from '@univerjs/core';
import { DisableCrosshairHighlightOperation, EnableCrosshairHighlightOperation, SetCrosshairHighlightColorOperation } from '../commands/operations/operation';

interface IFUniverCrosshairHighlightMixin {
    /**
     * Enable or disable crosshair highlight.
     * @param {boolean} enabled if crosshair highlight should be enabled
     */
    setCrosshairHighlightEnabled(enabled: boolean): void;

    /**
     * Set the color of the crosshair highlight.
     * @param {string} color the color of the crosshair highlight
     */
    setCrosshairHighlightColor(color: string): void;
}

class FUniverCrosshairHighlightMixin extends FUniver implements IFUniverCrosshairHighlightMixin {
    override setCrosshairHighlightEnabled(enabled: boolean): void {
        if (enabled) {
            this._commandService.executeCommand(EnableCrosshairHighlightOperation.id);
        } else {
            this._commandService.executeCommand(DisableCrosshairHighlightOperation.id);
        }
    }

    override setCrosshairHighlightColor(color: string): void {
        this._commandService.executeCommand(SetCrosshairHighlightColorOperation.id, {
            value: color,
        } as ISetCrosshairHighlightColorOperationParams);
    }
}

FUniver.extend(FUniverCrosshairHighlightMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverCrosshairHighlightMixin {}
}
