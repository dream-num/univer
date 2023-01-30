import { IDocumentData, ISlideData, IWorkbookConfig, UniverDoc, UniverSheet, UniverSlide } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { BaseComponentPlugin } from '@univerjs/base-component';
import { UniverComponentSheet } from '@univerjs/style-univer';
import { ISheetPluginConfig, SheetPlugin } from '@univerjs/base-sheets';
import { IDocPluginConfig, DocPlugin } from '@univerjs/base-docs';
import { ISlidePluginConfig, SlidePlugin } from '@univerjs/base-slides';
import { DEFAULT_WORKBOOK_DATA } from '@univerjs/common-plugin-data';
import { CollaborationPlugin, ICollaborationPluginConfig } from '@univerjs/common-plugin-collaboration';
import { DEFAULT_FORMULA_DATA, FormulaPlugin, IFormulaConfig } from '@univerjs/sheets-plugin-formula';
import { INumfmtPluginConfig, NumfmtPlugin } from '@univerjs/sheets-plugin-numfmt';
import { ClipboardPlugin } from '@univerjs/sheets-plugin-clipboard';
import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';

interface ISheetPropsCustom {
    coreConfig?: Partial<IWorkbookConfig>;
    baseSheetsConfig?: ISheetPluginConfig;
    numfmtConfig?: INumfmtPluginConfig;
    formulaConfig?: IFormulaConfig;
    collaborationConfig?: ICollaborationPluginConfig;
}

/**
 * Initialize the core and all plugins
 */
class UniverSheetCustom {
    constructor() {}
    init(config: ISheetPropsCustom = {}): UniverSheet {
        const universheet = UniverSheet.newInstance(config.coreConfig);

        universheet.installPlugin(new RenderEngine());
        universheet.installPlugin(new UniverComponentSheet());
        universheet.installPlugin(new SheetPlugin(config.baseSheetsConfig));
        universheet.installPlugin(new BaseComponentPlugin());
        universheet.installPlugin(new NumfmtPlugin(config.numfmtConfig));
        FormulaPlugin.create(config.formulaConfig).installTo(universheet);

        universheet.installPlugin(new ClipboardPlugin());
        universheet.installPlugin(new ImportXlsxPlugin());
        universheet.installPlugin(new CollaborationPlugin(config.collaborationConfig));

        return universheet;
    }
}
/**
 * Wrapped into a function,easy to use
 * @param config
 * @returns
 */
const univerSheetCustom = function (config?: ISheetPropsCustom) {
    return new UniverSheetCustom().init(config);
};

interface IDocPropsCustom {
    coreConfig?: Partial<IDocumentData>;
    baseDocsConfig?: IDocPluginConfig;
}

/**
 * Initialize the core and all plugins
 */
class UniverDocCustom {
    constructor() {}
    init(config: IDocPropsCustom = {}): UniverDoc {
        const univerdoc = UniverDoc.newInstance(config.coreConfig);

        univerdoc.installPlugin(new RenderEngine());
        univerdoc.installPlugin(new UniverComponentSheet());
        univerdoc.installPlugin(new DocPlugin(config.baseDocsConfig));

        return univerdoc;
    }
}
/**
 * Wrapped into a function,easy to use
 * @param config
 * @returns
 */
const univerDocCustom = function (config?: IDocPropsCustom) {
    return new UniverDocCustom().init(config);
};

interface ISlidePropsCustom {
    coreConfig?: Partial<ISlideData>;
    baseSlidesConfig?: ISlidePluginConfig;
}

/**
 * Initialize the core and all plugins
 */
class UniverSlideCustom {
    constructor() {}
    init(config: ISlidePropsCustom = {}): UniverSlide {
        const universlide = UniverSlide.newInstance(config.coreConfig);

        universlide.installPlugin(new RenderEngine());
        universlide.installPlugin(new UniverComponentSheet());
        universlide.installPlugin(new SlidePlugin(config.baseSlidesConfig));

        return universlide;
    }
}
/**
 * Wrapped into a function,easy to use
 * @param config
 * @returns
 */
const univerSlideCustom = function (config?: ISlidePropsCustom) {
    return new UniverSlideCustom().init(config);
};

export { univerSheetCustom, univerDocCustom, univerSlideCustom };

export * as UniverCore from '@univerjs/core';
export * as BaseRender from '@univerjs/base-render';
export * as BaseComponent from '@univerjs/base-component';
export * as StyleUniver from '@univerjs/style-univer';
export * as BaseSheets from '@univerjs/base-sheets';
export * as BaseDocs from '@univerjs/base-docs';
export * as BaseSlides from '@univerjs/base-slides';
export * as CommonPluginData from '@univerjs/common-plugin-data';
export * as CommonPluginCollaboration from '@univerjs/common-plugin-collaboration';
export * as SheetsPluginFormula from '@univerjs/sheets-plugin-formula';
export * as SheetsPluginNumfmt from '@univerjs/sheets-plugin-numfmt';
export * as SheetsPluginClipboard from '@univerjs/sheets-plugin-clipboard';
export * as SheetsPluginImportXlsx from '@univerjs/sheets-plugin-import-xlsx';
