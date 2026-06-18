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

import type { IUniverDocsConfig } from '@univerjs/docs';
import type { IUniverEngineFormulaConfig } from '@univerjs/engine-formula';
import type { IUniverSheetsConfig } from '@univerjs/sheets';
import type { IUniverSheetsFormulaBaseConfig } from '@univerjs/sheets-formula';
import type { IUniverSheetsFormulaUIConfig } from '@univerjs/sheets-formula-ui';
import type { IUniverSheetsUIConfig } from '@univerjs/sheets-ui';

export interface IUniverFormulaConfig extends
    Pick<IUniverEngineFormulaConfig, 'function'>,
    Pick<IUniverSheetsFormulaBaseConfig, 'description' | 'initialFormulaComputing'>,
    Pick<IUniverSheetsFormulaUIConfig, 'functionScreenTips'> {
}

export interface IUniverFormulaWorkerConfig extends
    Pick<IUniverEngineFormulaConfig, 'function'> {
}

export interface IUniverDocsPresetConfig extends
    IUniverDocsConfig {
}

export interface IUniverSheetsPresetConfig extends
    Pick<IUniverSheetsConfig, 'isRowStylePrecedeColumnStyle' | 'autoHeightForMergedCells' | 'freezeSync'>,
    Pick<IUniverSheetsUIConfig, 'maxAutoHeightCount' | 'clipboardConfig' | 'scrollConfig' | 'protectedRangeShadow' | 'protectedRangeUserSelector' | 'disableForceStringAlert' | 'disableForceStringMark'> {
}
