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
import type { IUniverThreadCommentConfig } from '@univerjs/thread-comment';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import '@univerjs/sheets-thread-comment/facade';

export type * from '@univerjs/sheets-thread-comment/facade';

export interface IUniverSheetsThreadCommentPresetConfig extends IUniverThreadCommentConfig {
}

/**
 * This preset add thread comment features into your application.
 *
 * @param {Partial<IUniverSheetsThreadCommentPresetConfig>} config - The configuration object.
 */
export function UniverSheetsThreadCommentPreset(config: Partial<IUniverSheetsThreadCommentPresetConfig> = {}): IPreset {
    const { permissions, overrides } = config;
    const plugins: IPreset['plugins'] = [
        [UniverThreadCommentPlugin, { permissions, overrides }],
        UniverThreadCommentUIPlugin,
        UniverSheetsThreadCommentPlugin,
        UniverSheetsThreadCommentUIPlugin,
    ];

    return { plugins };
}
