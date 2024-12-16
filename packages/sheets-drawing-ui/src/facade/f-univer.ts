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

import { FUniver } from '@univerjs/core';
import { FOverGridImageBuilder } from './f-over-grid-image';

export interface IFUniverSheetsDrawingMixin {
    /**
     * Create a new over grid image builder.
     * @returns The builder
     * @example
     * ```ts
     * // create a new over grid image builder.
     * const builder = UniverApi.newOverGridImage();
     * ```
     */
    newOverGridImage(): FOverGridImageBuilder;

}

export class FUniverSheetsDrawingMixin extends FUniver implements IFUniverSheetsDrawingMixin {
    override newOverGridImage(): FOverGridImageBuilder {
        return this._injector.createInstance(FOverGridImageBuilder);
    }
}

FUniver.extend(FUniverSheetsDrawingMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsDrawingMixin {}
}
