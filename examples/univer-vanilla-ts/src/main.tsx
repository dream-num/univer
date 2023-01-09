import { UniverSheet, UniverDoc, UniverSlide, Univer } from '@univer/core';
import { RenderEngine } from '@univer/base-render';
import { UniverComponentSheet } from '@univer/style-univer';
import { SheetPlugin } from '@univer/base-sheets';
import {
    DEFAULT_FORMULA_DATA,
    DEFAULT_FORMULA_DATA_DEMO,
    DEFAULT_FORMULA_DATA_DEMO1,
    FormulaPlugin,
} from '@univer/sheets-plugin-formula';
import { NumfmtPlugin } from '@univer/sheets-plugin-numfmt';
import {
    DEFAULT_WORKBOOK_DATA,
    DEFAULT_WORKBOOK_DATA_DEMO,
    DEFAULT_WORKBOOK_DATA_DEMO1,
    DEFAULT_WORKBOOK_DATA_DEMO2,
    DEFAULT_WORKBOOK_DATA_DEMO3,
    DEFAULT_WORKBOOK_DATA_DEMO4,
    DEFAULT_WORKBOOK_DATA_DOWN,
} from '@univer/common-plugin-data';
import { ClipboardPlugin } from '@univer/sheets-plugin-clipboard';
import { BaseComponentPlugin } from '@univer/base-component';
import { ImportXlsxPlugin } from '@univer/sheets-plugin-import-xlsx';

const univerConfig = {
    container: 'universheet',
};

const univer = new Univer();
univer.install(new RenderEngine());
univer.install(new UniverComponentSheet());
univer.install(new BaseComponentPlugin(univerConfig));
