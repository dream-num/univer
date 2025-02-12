/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IFontLocale } from './sheets/util';
import { Inject } from '@wendellhu/redi';
import { LocaleService } from './services/locale/locale.service';
import { Disposable } from './shared/lifecycle';

export class Skeleton extends Disposable {
    private _fontLocale!: IFontLocale;

    private _dirty = true;

    constructor(@Inject(LocaleService) protected readonly _localeService: LocaleService) {
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

    override dispose() {
        super.dispose();
        this._fontLocale = null as unknown as IFontLocale;
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
