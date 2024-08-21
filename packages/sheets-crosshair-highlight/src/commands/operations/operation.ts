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

import { CommandType, type IOperation } from '@univerjs/core';
import { SheetsCrosshairHighlightService } from '../../services/ch.service';

export const ToggleCrosshairHighlightOperation: IOperation = {
    id: 'sheet.operation.toggle-crosshair-highlight',
    type: CommandType.OPERATION,
    handler(accessor) {
        const service = accessor.get(SheetsCrosshairHighlightService);
        const turnedOn = service.enabled;
        service.setEnabled(!turnedOn);
        return true;
    },
};

export interface ISetCrosshairHighlightColorOperationParams {
    value: string;
}

export const SetCrosshairHighlightColorOperation: IOperation<ISetCrosshairHighlightColorOperationParams> = {
    id: 'sheet.operation.set-crosshair-highlight-color',
    type: CommandType.OPERATION,
    handler(accessor, { value }) {
        const service = accessor.get(SheetsCrosshairHighlightService);
        if (!service.enabled) service.setEnabled(true);
        service.setColor(value);
        return true;
    },
};

export const EnableCrosshairHighlightOperation: IOperation = {
    id: 'sheet.operation.enable-crosshair-highlight',
    type: CommandType.OPERATION,
    handler(accessor) {
        const service = accessor.get(SheetsCrosshairHighlightService);
        if (service.enabled) {
            return false;
        }

        service.setEnabled(true);
        return true;
    },
};

export const DisableCrosshairHighlightOperation: IOperation = {
    id: 'sheet.operation.disable-crosshair-highlight',
    type: CommandType.OPERATION,
    handler(accessor) {
        const service = accessor.get(SheetsCrosshairHighlightService);
        if (!service.enabled) {
            return false;
        }

        service.setEnabled(false);
        return true;
    },
};
