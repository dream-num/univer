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

import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';

export const CreateFloatDomCommand: ICommand = {
    id: 'debugger.command.create-float-dom',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const floatDomService = accessor.get(SheetCanvasFloatDomManagerService);
        floatDomService.addFloatDomToPosition({
            allowTransform: true,
            initPosition: {
                startX: 200,
                endX: 400,
                startY: 200,
                endY: 400,
            },
            componentKey: 'ImageDemo',
            props: {
                a: 1,
            },
            data: {
                aa: '128',
            },
        });
        return true;
    },
};
