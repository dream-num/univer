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

import type { IPresetBuildConfig } from '@univerjs-infra/shared/preset-build';

const config: IPresetBuildConfig = {
    umdDeps: [
        '@univerjs/docs',
        '@univerjs/rpc-node',
        '@univerjs/sheets',
        '@univerjs/sheets-numfmt',
        '@univerjs/sheets-data-validation',
        '@univerjs/sheets-drawing',
        '@univerjs/sheets-filter',
        '@univerjs/sheets-formula',
        '@univerjs/sheets-hyper-link',
        '@univerjs/sheets-sort',
        '@univerjs/thread-comment',
        '@univerjs/sheets-thread-comment',
    ],
};

export default config;
