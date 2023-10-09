import { Disposable, LocaleService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IFontLocale } from '../Basics/Interfaces';

export class Skeleton extends Disposable {
    private _fontLocale!: IFontLocale;

    private _dirty = true;

    constructor(@Inject(LocaleService) protected readonly _localService: LocaleService) {
        super();

        this._localeInitial();
    }

    get dirty() {
        return this._dirty;
    }

    getFontLocale() {
        return this._fontLocale;
    }

    makeDirty(state: boolean) {
        this._dirty = state;
    }

    private _localeInitial() {
        // TODO: should be load from config file
        // this._fontLocale = {
        //     defaultFont: 'Times New Roman',
        //     fontList: [
        //         'Times New Roman',
        //         'Arial',
        //         'Tahoma',
        //         'Verdana',
        //         '微软雅黑',
        //         '宋体',
        //         '黑体',
        //         '楷体',
        //         '仿宋',
        //         '新宋体',
        //         '华文新魏',
        //         '华文行楷',
        //         '华文隶书',
        //     ],
        //     defaultFontSize: 14,
        //     unit: 'pt',
        // } as IFontLocale;
    }
}
