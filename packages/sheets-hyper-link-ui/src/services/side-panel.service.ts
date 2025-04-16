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

import type { ISheetHyperLink } from '@univerjs/sheets-hyper-link';
import type React from 'react';
import { Disposable } from '@univerjs/core';
import { SheetHyperLinkType } from '@univerjs/sheets-hyper-link';

export interface ICustomHyperLinkFormProps {
    linkId: string;
    payload: string;
    display: string;
    setByPayload: React.MutableRefObject<boolean>;
    showError: boolean;
    setDisplay: (display: string) => void;
    setPayload: (payload: string) => void;
}

export interface ICustomHyperLinkView {
    type: string;
    option: {
        label: string;
        value: string;
    };
    Form: React.FC<ICustomHyperLinkFormProps>;
    convert: (link: ISheetHyperLink) => { display: string; payload: string; type: string };
    match: (link: ISheetHyperLink) => boolean;
}

export class SheetsHyperLinkSidePanelService extends Disposable {
    private _customHyperLinks = new Map<string, ICustomHyperLinkView>();

    isBuiltInLinkType(type: SheetHyperLinkType | string) {
        return type !== SheetHyperLinkType.URL;
    }

    getOptions() {
        return Array.from(this._customHyperLinks.values()).map(({ option }) => option);
    }

    findCustomHyperLink(link: ISheetHyperLink) {
        const customLink = Array.from(this._customHyperLinks.values()).find((item) => item.match(link));

        return customLink;
    }

    registerCustomHyperLink(customHyperLink: ICustomHyperLinkView) {
        this._customHyperLinks.set(customHyperLink.type, customHyperLink);
    }

    getCustomHyperLink(type: string) {
        return this._customHyperLinks.get(type);
    }

    removeCustomHyperLink(type: string) {
        const { _customHyperLinks } = this;
        _customHyperLinks.delete(type);
    }

    override dispose() {
        super.dispose();
        this._customHyperLinks.clear();
    }
}
