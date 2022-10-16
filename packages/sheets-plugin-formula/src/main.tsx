import { UniverSheet } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { DEFAULT_WORKBOOK_DATA } from '@univer/common-plugin-data';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';
import { FormulaPlugin } from './FormulaPlugin';
import { DEFAULT_FORMULA_DATA } from './Basic/DEFAULT_FORMULA_DATA';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
    layout: 'auto',
};

const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
FormulaPlugin.create(DEFAULT_FORMULA_DATA).installTo(univerSheetUp);
univerSheetUp.installPlugin(new SpreadsheetPlugin(uiDefaultConfigUp));
