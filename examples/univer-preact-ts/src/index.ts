import { IWorkbookConfig, UniverSheet } from '@univer/core';
import * as UniverCore from '@univer/core'
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-universheet';
import { ISheetPluginConfig, SheetPlugin } from '@univer/base-sheets';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';

interface IPropsCustom {
    coreConfig?: Partial<IWorkbookConfig>;
    baseSheetsConfig?: ISheetPluginConfig;
}

/**
 * Initialize the core and all plugins
 */
class UniverSheetCustom {
    constructor() {}
    init(config: IPropsCustom = {}): UniverSheet {
        const universheet = UniverSheet.newInstance(config.coreConfig);

        universheet.installPlugin(new RenderEngine());
        universheet.installPlugin(new UniverComponentSheet());
        universheet.installPlugin(new SheetPlugin(config.baseSheetsConfig));

        return universheet;
    }
}
/**
 * Wrapped into a function,easy to use
 * @param config
 * @returns
 */
const univerSheetCustom = function (config?: IPropsCustom) {
    return new UniverSheetCustom().init(config);
};
export {UniverCore, univerSheetCustom, DEFAULT_WORKBOOK_DATA };
