import { IShowToolBarConfig, IToolBarItemProps } from '@univer/base-component';

export class ToolBarModel {
    private _config: IShowToolBarConfig[];

    private _toolList: IToolBarItemProps[];

    get config(): IShowToolBarConfig[] {
        return this._config;
    }

    get toolList(): IToolBarItemProps[] {
        return this._toolList;
    }

    set config(value: IShowToolBarConfig[]) {
        this._config = value;
    }

    set toolList(value: IToolBarItemProps[]) {
        this._toolList = value;
    }
}
