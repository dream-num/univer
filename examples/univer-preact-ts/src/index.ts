import { Univer, IDocumentData, ISlideData, IWorkbookConfig, UniverDoc, UniverSheet, UniverSlide } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';

import { ISheetPluginConfig, SheetPlugin } from '@univerjs/base-sheets';
import { SheetUIPlugin,ISheetUIPluginConfig } from '@univerjs/ui-plugin-sheets';
import { DocUIPlugin, IDocUIPluginConfig } from '@univerjs/ui-plugin-docs';
import { SlideUIPlugin, ISlideUIPluginConfig } from '@univerjs/ui-plugin-slides';
import { IDocPluginConfig, DocPlugin } from '@univerjs/base-docs';
import { ISlidePluginConfig, SlidePlugin } from '@univerjs/base-slides';
import { DEFAULT_WORKBOOK_DATA } from '@univerjs/common-plugin-data';
// import { CollaborationPlugin, ICollaborationPluginConfig } from '@univerjs/common-plugin-collaboration';
import { DEFAULT_FORMULA_DATA, FormulaPlugin, IFormulaConfig } from '@univerjs/sheets-plugin-formula';
import { CollaborationPlugin, ICollaborationPluginConfig } from '@univerjs/common-plugin-collaboration';
import { ClipboardPlugin } from '@univerjs/sheets-plugin-clipboard';
import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';
import { UIPlugin } from '@univerjs/base-ui';
// import { INumfmtPluginConfig, NumfmtPlugin } from '@univerjs/sheets-plugin-numfmt';
// import { ClipboardPlugin } from '@univerjs/sheets-plugin-clipboard';
// import { ImportXlsxPlugin } from '@univerjs/sheets-plugin-import-xlsx';

interface ISheetPropsCustom {
    coreConfig?: Partial<IWorkbookConfig>;
    baseSheetsConfig?: ISheetPluginConfig;
    uiSheetsConfig?: ISheetUIPluginConfig;
    // numfmtConfig?: INumfmtPluginConfig;
    formulaConfig?: IFormulaConfig;
    collaborationConfig?: ICollaborationPluginConfig;
}

/**
 * Initialize the core and all plugins
 */
class UniverSheetCustom {
    constructor() {}
    init(config: ISheetPropsCustom = {}): UniverSheet {
        const univer = new Univer();
        
        // base-render
        univer.install(new RenderEngine());
        // universheet instance
        const universheet = UniverSheet.newInstance(config.coreConfig);
        univer.addUniverSheet(universheet);

        univer.install(new UIPlugin())
        // base-sheets
        universheet.installPlugin(new SheetPlugin(config.baseSheetsConfig));

        // ui-plugin-sheets
        univer.install(
            new SheetUIPlugin(config.uiSheetsConfig)
        );
        univer.install(new CollaborationPlugin(config.collaborationConfig));
        // universheet.installPlugin(new NumfmtPlugin(config.numfmtConfig));
        // FormulaPlugin.create(config.formulaConfig).installTo(universheet);

        universheet.installPlugin(new ClipboardPlugin());
        universheet.installPlugin(new ImportXlsxPlugin());

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
    uiDocsConfig?: IDocUIPluginConfig;
}

/**
 * Initialize the core and all plugins
 */
class UniverDocCustom {
    constructor() {}
    init(config: IDocPropsCustom = {}): UniverDoc {

        const univer = new Univer();
        
        // base-render
        univer.install(new RenderEngine());

        // univerdoc instance
        const univerdoc = UniverDoc.newInstance(config.coreConfig);
        univer.addUniverDoc(univerdoc);

        univer.install(new UIPlugin())
        // base-docs
        univerdoc.installPlugin(new DocPlugin(config.baseDocsConfig));

        // ui-plugin-sheets
        univer.install(
            new DocUIPlugin(config.uiDocsConfig)
        );

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
    uiSlidesConfig?: ISlideUIPluginConfig;
}

/**
 * Initialize the core and all plugins
 */
class UniverSlideCustom {
    constructor() {}
    init(config: ISlidePropsCustom = {}): UniverSlide {
        const univer = new Univer();
        
        // base-render
        univer.install(new RenderEngine());
        // universlide instance
        const universlide = UniverSlide.newInstance(config.coreConfig);
        univer.addUniverSlide(universlide);

        univer.install(new UIPlugin())
        // base-slides
        universlide.installPlugin(new SlidePlugin(config.baseSlidesConfig));
        // ui-plugin-slides
        univer.install(
            new SlideUIPlugin(config.uiSlidesConfig)
        );

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
export * as BaseComponent from '@univerjs/base-ui';
export * as BaseSheets from '@univerjs/base-sheets';
export * as BaseDocs from '@univerjs/base-docs';
export * as BaseSlides from '@univerjs/base-slides';
export * as UIPluginSheets from '@univerjs/ui-plugin-sheets';
export * as UIPluginDocs from '@univerjs/ui-plugin-docs';
export * as UIPluginSlides from '@univerjs/ui-plugin-slides';
export * as CommonPluginData from '@univerjs/common-plugin-data';
// export * as CommonPluginCollaboration from '@univerjs/common-plugin-collaboration';
// export * as SheetsPluginFormula from '@univerjs/sheets-plugin-formula';
// export * as SheetsPluginNumfmt from '@univerjs/sheets-plugin-numfmt';
// export * as SheetsPluginClipboard from '@univerjs/sheets-plugin-clipboard';
// export * as SheetsPluginImportXlsx from '@univerjs/sheets-plugin-import-xlsx';
