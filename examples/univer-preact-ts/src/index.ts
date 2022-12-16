import { IDocumentData, ISlideData, IWorkbookConfig, UniverDoc, UniverSheet, UniverSlide } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { BaseComponentPlugin } from '@univer/base-component';
import { UniverComponentSheet } from '@univer/style-universheet';
import { ISheetPluginConfig, SheetPlugin } from '@univer/base-sheets';
import { IDocPluginConfig, DocPlugin } from '@univer/base-docs';
import { ISlidePluginConfig, SlidePlugin } from '@univer/base-slides';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';
import { CollaborationPlugin, ICollaborationPluginConfig } from '@univer/common-plugin-collaboration';
import { DEFAULT_FORMULA_DATA, FormulaPlugin, IFormulaConfig } from '@univer/sheets-plugin-formula';
import { INumfmtPluginConfig, NumfmtPlugin } from '@univer/sheets-plugin-numfmt';
import { ClipboardPlugin } from '@univer/sheets-plugin-clipboard';
import { ImportXlsxPlugin } from '@univer/sheets-plugin-import-xlsx';

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

export * as UniverCore from '@univer/core';
export * as BaseRender from '@univer/base-render';
export * as BaseComponent from '@univer/base-component';
export * as StyleUniver from '@univer/style-universheet';
export * as BaseSheets from '@univer/base-sheets';
export * as BaseDocs from '@univer/base-docs';
export * as BaseSlides from '@univer/base-slides';
export * as CommonPluginData from '@univer/common-plugin-data';
export * as CommonPluginCollaboration from '@univer/common-plugin-collaboration';
export * as SheetsPluginFormula from '@univer/sheets-plugin-formula';
export * as SheetsPluginNumfmt from '@univer/sheets-plugin-numfmt';
export * as SheetsPluginClipboard from '@univer/sheets-plugin-clipboard';
export * as SheetsPluginImportXlsx from '@univer/sheets-plugin-import-xlsx';
