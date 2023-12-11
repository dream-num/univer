/**
 * Copyright 2023 DreamNum Inc.
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

import { InfoBarModel } from '../model/info-bar-model';
import type { InfoBar } from '../views/info-bar';

interface IProps {
    label?: string;
    onBlur?: (e: FocusEvent) => void;
}

export interface BaseInfoBarProps {
    back: IProps;
    rename: IProps;
    save: IProps;
    slide: IProps;
    update: IProps;
}

export class InfoBarUIController {
    private _infoBarModel?: InfoBarModel;

    private _infoBar?: InfoBar;

    private _infoList?: BaseInfoBarProps;

    // constructor() { }

    getComponent = (ref: InfoBar) => {
        this._infoBar = ref;
        this._refreshComponent();
        this.resetInfoList(this._infoList!);
    };

    resetInfoList(list: BaseInfoBarProps) {
        this._infoBar!.setInfoList(list);
    }

    setSlideName(e: FocusEvent) {
        const target = e.target as HTMLInputElement;
        const name = target.value;
        this._infoBarModel!.setName(name);
    }

    private _refreshComponent(): void {
        const name = 'UniverSlide';
        // const name = this._plugin.getUniver().getCurrentUniverSlideInstance().getConfig().name;
        this._infoBarModel = new InfoBarModel(name);
        this._infoList = {
            back: {
                label: 'info.return',
            },
            rename: {
                label: 'info.tips',
            },
            update: {
                label: 'info.detailUpdate',
            },
            save: {
                label: 'info.detailSave',
            },
            slide: {
                label: name,
                onBlur: (e) => {
                    this.setSlideName(e);
                },
            },
        };
    }
}
