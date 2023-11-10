import { ComponentManager } from '@univerjs/base-ui';
import { LocaleService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import React from 'react';

import { CURRENCYDETAIL, DATEFMTLISG, NUMBERFORMAT, NUMFMT_PLUGIN_NAME } from '../basics/const';
import { NumfmtModel } from '../model/numfmt-model';
import { INumfmtPluginData } from '../symbol';
import { FormatContent } from '../views/ui/FormatContent';
import { NumfmtModal } from '../views/ui/NumfmtModal';

interface GroupProps {
    locale: string;
    type?: string;
    label?: string;
    onClick?: () => void;
}

export interface ModalDataProps {
    name?: string;
    title?: string;
    show: boolean;
    locale: string;
    children: {
        name: string;
        props: any;
    };
    group: GroupProps[];
    modal?: React.ReactNode; // 渲染的组件
    onCancel?: () => void;
}

export class NumfmtModalController {
    protected _modalData: ModalDataProps[];

    constructor(
        @Inject(INumfmtPluginData) private _numfmtPluginData: NumfmtModel,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        this._modalData = [
            {
                locale: 'toolbar.currencyFormat',
                name: 'currency',
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                        onClick: () => {},
                    },
                    {
                        locale: 'button.cancel',
                        onClick: () => {},
                    },
                ],
                show: false,
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: this.resetContentData(CURRENCYDETAIL),
                        input: this._localeService.t('format.decimalPlaces'),
                        onClick: (value: string) => console.dir(value),
                        onChange: (value: string) => console.dir(value),
                    },
                },
                onCancel: (): void => {
                    this.showModal('currency', false);
                },
            },
            {
                locale: 'toolbar.currencyFormat',
                name: 'date',
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
                show: false,
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: DATEFMTLISG,
                        onClick: (value: string) => console.dir(value),
                    },
                },
                onCancel: (): void => {
                    this.showModal('currency', false);
                },
            },
            {
                locale: 'toolbar.numberFormat',
                name: 'number',
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
                show: false,
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: NUMBERFORMAT,
                        onClick: (value: string) => console.dir(value),
                    },
                },
                onCancel: (): void => {
                    this.showModal('number', false);
                },
            },
        ];
        this._componentManager.register(NUMFMT_PLUGIN_NAME + FormatContent.name, FormatContent);
        this._componentManager.register(NUMFMT_PLUGIN_NAME + NumfmtModal.name, NumfmtModal);
    }

    resetContentData(data: any[]): any[] {
        for (let i = 0; i < data.length; i++) {
            if (data[i].locale) {
                data[i].label = this._localeService.t(data[i].locale);
            }
        }
        return data;
    }

    // 渲染所需数据
    resetModalData(): void {
        this._modalData.forEach((item) => {
            item.title = this._localeService.t(item.locale);
            if (item.group && item.group.length) {
                item.group.forEach((ele) => {
                    ele.label = this._localeService.t(ele.locale);
                });
            }
        });

        // TODO update modal data
        // this._numfmtPluginData.setModal(this._modalData);
    }

    showModal(name: string, show: boolean): void {
        const index: number = this._modalData.findIndex((item) => item.name === name);
        if (index > -1) {
            this._modalData[index].show = show;
            this.resetModalData();
        }
    }
}
