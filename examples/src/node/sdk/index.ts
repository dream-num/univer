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

import path from 'node:path';
import { LocaleType, Univer } from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRPCNodeMainPlugin } from '@univerjs/rpc-node';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';

import { enUS } from '../../locales';

import './facade';

export interface ICreateUniverOnNodeOptions {
    useComputingWorker?: boolean;
}

export function createUniverOnNode(options: ICreateUniverOnNodeOptions = {}): Univer {
    const { useComputingWorker = false } = options;

    const univer = new Univer({
        locale: LocaleType.EN_US,
        locales: {
            [LocaleType.EN_US]: enUS,
        },
    });

    registerBasicPlugins(univer, useComputingWorker);
    registerSharedPlugins(univer);

    if (useComputingWorker) {
        registerRPCPlugin(univer);
    }

    registerDocPlugins(univer);
    registerSheetPlugins(univer);

    return univer;
}

function registerBasicPlugins(univer: Univer, useComputingWorker: boolean): void {
    univer.registerPlugin(UniverFormulaEnginePlugin, { notExecuteFormula: useComputingWorker });
}

function registerSharedPlugins(univer: Univer): void {
    univer.registerPlugin(UniverThreadCommentPlugin);
    univer.registerPlugin(UniverDrawingPlugin);
}

function registerDocPlugins(univer: Univer): void {
    univer.registerPlugin(UniverDocsPlugin);
    univer.registerPlugin(UniverDocsDrawingPlugin);
}

function registerSheetPlugins(univer: Univer): void {
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsFormulaPlugin);
    univer.registerPlugin(UniverSheetsConditionalFormattingPlugin);
    univer.registerPlugin(UniverDataValidationPlugin);
    univer.registerPlugin(UniverSheetsDataValidationPlugin);
    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(UniverSheetsHyperLinkPlugin);
    univer.registerPlugin(UniverSheetsDrawingPlugin);
    univer.registerPlugin(UniverSheetsSortPlugin);
}

function registerRPCPlugin(univer: Univer): void {
    const childPath = path.join(__dirname, '../sdk/worker.js');
    univer.registerPlugin(UniverRPCNodeMainPlugin, { workerSrc: childPath });
}
