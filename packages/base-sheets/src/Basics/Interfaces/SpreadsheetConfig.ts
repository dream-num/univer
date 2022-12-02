import { ISheetPluginConfigBase } from '../../Controller';
import { ISelectionsConfig } from './SelectionConfig';

export interface ISheetPluginConfig extends ISheetPluginConfigBase {
    container: HTMLElement | string;
    selections: ISelectionsConfig;
}
