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

import type { UniverInstanceType } from '@univerjs/core';
import type { FUnitFacade } from './f-univer';

// eslint-disable-next-line ts/no-namespace -- Type-only namespace enables `UniverFacadeTypes.FWorkbook` without a runtime value.
export namespace UniverFacadeTypes {
    export type FDocument = FUnitFacade<UniverInstanceType.UNIVER_DOC>;
    export type FWorkbook = FUnitFacade<UniverInstanceType.UNIVER_SHEET>;
    export type FPresentation = FUnitFacade<UniverInstanceType.UNIVER_SLIDE>;
    export type FBase = FUnitFacade<UniverInstanceType.UNIVER_BASE>;
    export type ByUnitType<TUnitType extends UniverInstanceType> = FUnitFacade<TUnitType>;
}
