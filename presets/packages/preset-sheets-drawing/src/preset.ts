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

import type { IUniverDrawingConfig } from '@univerjs/drawing';
import type { IPreset } from '@univerjs/presets';
import { IImageIoService } from '@univerjs/core';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui';

import '@univerjs/sheets-drawing/facade';
import '@univerjs/sheets-drawing-ui/facade';

export type * from '@univerjs/sheets-drawing-ui/facade';
export type * from '@univerjs/sheets-drawing/facade';

export interface IUniverSheetsDrawingPresetConfig extends Pick<IUniverDrawingConfig, 'allowImageSize'> {
    collaboration?: boolean;
}

export function UniverSheetsDrawingPreset(config: Partial<IUniverSheetsDrawingPresetConfig> = {}): IPreset {
    const { collaboration = false, allowImageSize } = config;

    return {
        plugins: [
            [UniverDrawingPlugin, {
                override: collaboration ? [[IImageIoService, null]] : [],
                allowImageSize,
            }],
            UniverDocsDrawingPlugin,
            UniverDrawingUIPlugin,
            UniverSheetsDrawingPlugin,
            UniverSheetsDrawingUIPlugin,
        ].filter((v) => !!v) as IPreset['plugins'],
    };
};
