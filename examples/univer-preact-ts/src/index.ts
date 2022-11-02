import { IStyleConfig } from '@univer/base-component';
import { IWorkbookConfig, UniverSheet } from '@univer/core';
import { FilterPlugin } from '@univer/sheets-plugin-filter';
import { SheetPlugin } from '@univer/base-sheets';
import { StyleUniver } from '@univer/style-universheet';

interface IPropsCustom {
    workbookConfig?: Partial<IWorkbookConfig>;
    spreadsheetConfig?: IStyleConfig;
}

/**
 * Initialize the core and all plugins
 */
class UniverSheetCustom {
    constructor() {}
    init(config: IPropsCustom = {}): UniverSheet {
        const univerSheetUp = UniverSheet.newInstance(config.workbookConfig);

        univerSheetUp.installPlugin(new StyleUniver(config.spreadsheetConfig));
        univerSheetUp.installPlugin(new SheetPlugin());
        univerSheetUp.installPlugin(new FilterPlugin());

        return univerSheetUp;
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
export { univerSheetCustom };
