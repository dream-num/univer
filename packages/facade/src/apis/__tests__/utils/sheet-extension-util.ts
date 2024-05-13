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

import type { IScale } from '@univerjs/core';
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { SheetExtension } from '@univerjs/engine-render';

export const COLUMN_UNIQUE_KEY = 'ColumnHeaderCustomExtension';

export class ColumnHeaderCustomExtension extends SheetExtension {
    override uKey = COLUMN_UNIQUE_KEY;

    // Must be greater than 10
    override get zIndex() {
        return 11;
    }

    override draw(ctx: UniverRenderingContext, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        // empty
    }
}

export const ROW_UNIQUE_KEY = 'RowHeaderCustomExtension';

export class RowHeaderCustomExtension extends SheetExtension {
    override uKey = ROW_UNIQUE_KEY;

    // Must be greater than 10
    override get zIndex() {
        return 11;
    }

    override draw(ctx: UniverRenderingContext, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        // empty
    }
}

export const MAIN_UNIQUE_KEY = 'MainCustomExtension';

export class MainCustomExtension extends SheetExtension {
    override uKey = MAIN_UNIQUE_KEY;

    // Must be greater than 50
    override get zIndex() {
        return 51;
    }

    override draw(ctx: UniverRenderingContext, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        // empty
    }
}
