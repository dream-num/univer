import { ISheetPluginConfigBase } from '../../View/UI/SheetContainer';
import { ISelectionsConfig } from './SelectionConfig';

export interface ISheetPluginConfig extends ISheetPluginConfigBase {
    container: HTMLElement | string;
    selections: ISelectionsConfig;
}
