import type { IUniverConfig, Plugin, PluginCtor } from '@univerjs/core';
import type { IUniverEngineFormulaConfig } from '@univerjs/engine-formula';
import type { IUniverSheetsFormulaBaseConfig } from '@univerjs/sheets-formula';

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
    Pick<IUniverSheetsFormulaBaseConfig, 'description' | 'initialFormulaComputing'> {
}

export interface IUniverFormulaWorkerConfig extends
    Pick<IUniverEngineFormulaConfig, 'function'> {
}
