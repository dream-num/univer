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

import type { DocumentDataModel, ITable } from '@univerjs/core';
import type { IDocumentLayoutRenderConfig } from '../docs/document-layout-presentation';
import { LineBreaker } from '../docs/layout/line-breaker/line-breaker';
import { DocumentViewModel } from '../docs/view-model/document-view-model';

export class SheetCellDocumentViewModel extends DocumentViewModel {
    override getLayoutRenderConfig(config: IDocumentLayoutRenderConfig): IDocumentLayoutRenderConfig {
        // Only cell stacking uses upright Latin glyphs; Docs and shapes retain their own vertical text rules.
        return config.centerAngle === 90 && config.vertexAngle === 90
            ? { ...config, stackedText: true }
            : config;
    }

    override getParagraphWordWrap(): undefined {
        // Cell layout ignores paragraph word splitting, including formatting pasted from Docs.
        return undefined;
    }

    override createLineBreaker(content: string) {
        return new LineBreaker(content);
    }

    protected override _createChildViewModel(model: DocumentDataModel, tableSource?: Record<string, ITable>): SheetCellDocumentViewModel {
        return new SheetCellDocumentViewModel(model, tableSource);
    }
}
