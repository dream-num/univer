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

import { UniverInstanceType } from '@univerjs/core';

export function createDocsCustomBlockHostAdapterContribution(..._args: unknown[]): {
    hostType: UniverInstanceType;
    entry: 'docs-custom-block';
    createAnchorPlan: (..._args: unknown[]) => never;
} {
    return {
        hostType: UniverInstanceType.UNIVER_DOC,
        entry: 'docs-custom-block',
        createAnchorPlan: () => {
            throw new Error('EMBED_DOCS_CUSTOM_BLOCK_ANCHOR_MOVED_TO_PRO_EMBED');
        },
    };
}
