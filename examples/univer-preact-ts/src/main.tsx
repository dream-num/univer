import { univerSheetCustom } from '.';

const workbookConfig = {
    id: '',
    sheetOrder: [],
    socketEnable: BooleanNumber.FALSE,
    socketUrl: '',
    name: '',
    timeZone: '',
    appVersion: '',
    theme: '',
    skin: '',
    locale: '',
    creator: '',
    styles: [],
    sheets: [],
    lastModifiedBy: '',
    createdTime: '',
    modifiedTime: '',
};

const spreadsheetConfig = {
    container: 'universheet-demo-up',
    layout: 'auto',
};

const universheet = univerSheetCustom({
    workbookConfig: workbookConfig,
    spreadsheetConfig: spreadsheetConfig,
});
