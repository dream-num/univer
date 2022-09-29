import { defaultWorkbookData, UniverSheet } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { UniverComponentSheet } from '@univer/style-universheet';
import { RenderEngine } from '@univer/base-render';
import { OverGridImagePlugin } from './OverGridImagePlugin';

const uiDefaultConfigUp = {
    containerId: 'universheet-demo-up',
    layout: 'auto',
};
const univerSheetInstance = UniverSheet.newInstance(defaultWorkbookData);
univerSheetInstance.installPlugin(new UniverComponentSheet());
univerSheetInstance.installPlugin(new RenderEngine());
univerSheetInstance.installPlugin(new SpreadsheetPlugin(uiDefaultConfigUp));
univerSheetInstance.installPlugin(
    new OverGridImagePlugin({
        value: [],
    })
);
