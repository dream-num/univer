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

import type { DocumentDataModel, IDisposable } from '@univerjs/core';
import type { IDocumentLayoutPresentation } from '@univerjs/engine-render';
import { toDisposable } from '@univerjs/core';
import { registerDocumentLayoutPresentation } from '@univerjs/engine-render';

export interface IEditorRuntimeConfig {
    layout?: IDocumentLayoutPresentation;
    inheritParagraphStartStyle?: boolean;
    disableSelectionAutoScroll?: boolean;
}

const configs = new WeakMap<DocumentDataModel, { config: IEditorRuntimeConfig }>();

export function registerEditorRuntimeConfig(model: DocumentDataModel, config: IEditorRuntimeConfig): IDisposable {
    const registration = { config };
    configs.set(model, registration);
    const layout = config.layout && registerDocumentLayoutPresentation(model, config.layout);
    return toDisposable(() => {
        layout?.dispose();
        if (configs.get(model) === registration) {
            configs.delete(model);
        }
    });
}

export function getEditorRuntimeConfig(model: DocumentDataModel): IEditorRuntimeConfig | undefined {
    return configs.get(model)?.config;
}
