import type { IUniverConfig, Plugin, PluginCtor } from '@univerjs/core';
import type { IUniverDocsConfig } from '@univerjs/docs';
import type { IUniverEngineFormulaConfig } from '@univerjs/engine-formula';
import type { IUniverSheetsConfig } from '@univerjs/sheets';
import type { IUniverSheetsFormulaBaseConfig } from '@univerjs/sheets-formula';
import type { IUniverSheetsFormulaUIConfig } from '@univerjs/sheets-formula-ui';
import type { IUniverSheetsUIConfig } from '@univerjs/sheets-ui';

/**
 * A collection of plugins and their default configs.
 */
export interface IPreset {
    plugins: Array<PluginCtor<Plugin> | [PluginCtor<Plugin>, ConstructorParameters<PluginCtor<Plugin>>[0]]>;
    locales?: IUniverConfig['locales'];
}

export interface IPresetOptions {
    lazy?: boolean;
}

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
