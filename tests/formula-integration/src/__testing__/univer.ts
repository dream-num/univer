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

import { FUniver, Univer } from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';

import '@univerjs/sheets/facade';
import '@univerjs/sheets-data-validation/facade';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets-formula/facade';

export function createFormulaTestBed() {
    const univer = createUniverOnNode();
    const injector = univer.__getInjector();

    return {
        univer,
        get: injector.get.bind(injector),
        api: FUniver.newAPI(univer),
    };
}

function createUniverOnNode(): Univer {
    const univer = new Univer();

    registerBasicPlugins(univer);
    registerDocPlugins(univer);
    registerSheetPlugins(univer);

    return univer;
}

function registerBasicPlugins(univer: Univer): void {
    univer.registerPlugin(UniverFormulaEnginePlugin, { notExecuteFormula: false });
}

function registerDocPlugins(univer: Univer): void {
    univer.registerPlugin(UniverDocsPlugin);
}

function registerSheetPlugins(univer: Univer): void {
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin);
    univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
    univer.registerPlugin(UniverDataValidationPlugin);
    univer.registerPlugin(UniverSheetsDataValidationPlugin);
}
