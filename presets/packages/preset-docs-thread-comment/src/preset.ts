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
import { UniverDocsThreadCommentUIPlugin } from '@univerjs/docs-thread-comment-ui';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';

export interface IUniverDocsThreadCommentPresetConfig {
}

/**
 * This preset add thread comment features into your application.
 *
 * @param {Partial<IUniverDocsThreadCommentPresetConfig>} config - The configuration object.
 */
export function UniverDocsThreadCommentPreset(_config: Partial<IUniverDocsThreadCommentPresetConfig> = {}): IPreset {
    const plugins: IPreset['plugins'] = [
        UniverThreadCommentUIPlugin,
        UniverDocsThreadCommentUIPlugin,
    ];

    return { plugins };
}
