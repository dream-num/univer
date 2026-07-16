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

import type { IPreset } from '@univerjs/presets';
import { IImageIoService } from '@univerjs/core';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';

import '@univerjs/docs-drawing/facade';

export type * from '@univerjs/docs-drawing/facade';

export interface IUniverDocsDrawingPresetConfig {
    collaboration?: boolean;
}

export function UniverDocsDrawingPreset(config: Partial<IUniverDocsDrawingPresetConfig> = {}): IPreset {
    const { collaboration = false } = config;

    return {
        plugins: [
            [UniverDrawingPlugin, { override: collaboration ? [[IImageIoService, null]] : [] }],
            UniverDrawingUIPlugin,
            UniverDocsDrawingPlugin,
            UniverDocsDrawingUIPlugin,
        ].filter((v) => !!v) as IPreset['plugins'],
    };
};
