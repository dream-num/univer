import { ISpreadsheetPluginConfigBase } from '../../View/UI/SheetContainer';
import { ISelectionsConfig } from './SelectionConfig';

export interface ISpreadsheetPluginConfig extends ISpreadsheetPluginConfigBase {
    container: HTMLElement | string;
    selections: ISelectionsConfig;
}
