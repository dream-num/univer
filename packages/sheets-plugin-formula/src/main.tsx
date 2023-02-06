import { UniverSheet } from '@univerjs/core';
import { RenderEngine } from '@univerjs/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univerjs/common-plugin-data';
import { SheetPlugin } from '@univerjs/base-sheets';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
};

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
// FormulaPlugin.create(DEFAULT_FORMULA_DATA).installTo(univerSheetUp);
univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));
