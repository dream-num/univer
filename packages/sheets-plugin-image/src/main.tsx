import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { DEFAULT_WORKBOOK_DATA } from '@univerjs/common-plugin-data';
import { UniverSheet } from '@univerjs/core';

const uiDefaultConfigUp = {
    container: 'universheet-demo-up',
};
const univerSheetUp = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA);
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new UniverComponentSheet());
univerSheetUp.installPlugin(new RenderEngine());
univerSheetUp.installPlugin(new SheetPlugin(uiDefaultConfigUp));
// univerSheetUp.installPlugin(
//     new OverGridImagePlugin({
//         value: [],
//     })
// );
