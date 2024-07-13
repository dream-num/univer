/**
 * Copyright 2023-present DreamNum Inc.
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

import { Disposable } from '@univerjs/core';
import { ICellHyperLink } from '@univerjs/sheets-hyper-link';
import React from 'react';


export interface CustomHyperLinkFormProps {
    payload: string,
    display: string,
    setByPayload: React.MutableRefObject<boolean>,
    showError: boolean,
    setDisplay: (display: string) => void,
    setPayload: (payload: string) => void,
    [prop: string]: any;
}

export interface ICustomHyperLinkView {
    type: string,
    option: {
        label: string,
        value: string
    },
    Form: React.FC<CustomHyperLinkFormProps>
}

export enum LinkType {
    link = 'link',
    range = 'range',
    sheet = 'gid',
    definedName = 'rangeid',
}

export class SheetsHyperLinkSidePanelService extends Disposable {
    private _customHyperLinks = new Map<string, ICustomHyperLinkView>();

    isBuiltInLinkType(type: string) {
        return Boolean((LinkType as any)[type])
    }

    getOptions() {
        return Array.from(this._customHyperLinks.values()).map(({ option }) => option);
    }

    registerCustomHyperLink(customHyperLink: ICustomHyperLinkView) {
        this._customHyperLinks.set(customHyperLink.type, customHyperLink);
    }

    getCustomHyperLink(type: string) {
        return this._customHyperLinks.get(type);
    }

    removeCustomHyperLink(type: string) {
        const { _customHyperLinks } = this;
        _customHyperLinks.delete(type)
    }

    override dispose() {
        super.dispose();
        this._customHyperLinks.clear();
    }
}
