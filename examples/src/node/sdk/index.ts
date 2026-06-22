import path from 'node:path';
import { LocaleType, Univer } from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import zhCN from '@univerjs/mockdata/locales/zh-CN';
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
import './facade';

export interface ICreateUniverOnNodeOptions {
    useComputingWorker?: boolean;
}

export function createUniverOnNode(options: ICreateUniverOnNodeOptions = {}): Univer {
    const { useComputingWorker = false } = options;

    const univer = new Univer({
        locale: LocaleType.ZH_CN,
        locales: {
            [LocaleType.ZH_CN]: zhCN,
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
