import { ComponentChildren } from '@univerjs/base-ui';
import { SheetPlugin } from '@univerjs/base-sheets';
import { PLUGIN_NAMES } from '@univerjs/core';
import { NUMBERFORMAT, NUMFMT_PLUGIN_NAME, CURRENCYDETAIL, DATEFMTLISG } from '../Basics/Const';
import { NumfmtPlugin } from '../NumfmtPlugin';
import { FormatContent } from '../View/UI/FormatContent';
import { NumfmtModal } from '../View/UI/NumfmtModal';

interface GroupProps {
    locale: string;
    label?: string;
    type?: string;
    onClick?: () => void;
}

export interface ModalDataProps {
    name?: string;
    title?: string;
    locale: string;
    show: boolean;
    children: {
        name: string;
        props: any;
    };
    onCancel?: () => void;
    group: GroupProps[];
    modal?: ComponentChildren; // 渲染的组件
}

export class NumfmtModalController {
    private _plugin: NumfmtPlugin;

    private _sheetPlugin: SheetPlugin;

    private _numfmtModal: NumfmtModal;

    private _modalData: ModalDataProps[];

    constructor(plugin: NumfmtPlugin) {
        const locale = plugin.getContext().getLocale();
        this._plugin = plugin;
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        this._modalData = [
            {
                name: 'currency',
                locale: 'toolbar.currencyFormat',
                show: false,
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
                onCancel: () => {
                    this.showModal('currency', false);
                },
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: this.resetContentData(CURRENCYDETAIL),
                        onClick: (value: string) => console.dir(value),
                        input: locale.get('format.decimalPlaces'),
                        onChange: (value: string) => console.dir(value),
                    },
                },
            },
            {
                name: 'date',
                locale: 'toolbar.currencyFormat',
                show: false,
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
                onCancel: () => {
                    this.showModal('currency', false);
                },
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: DATEFMTLISG,
                        onClick: (value: string) => console.dir(value),
                    },
                },
            },
            {
                name: 'number',
                locale: 'toolbar.numberFormat',
                show: false,
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
                onCancel: () => {
                    this.showModal('number', false);
                },
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: NUMBERFORMAT,
                        onClick: (value: string) => console.dir(value),
                    },
                },
            },
        ];
        this._initRegisterComponent();
        this._initialize();
    }

    resetContentData(data: any[]) {
        const locale = this._plugin.getGlobalContext().getLocale();
        for (let i = 0; i < data.length; i++) {
            if (data[i].locale) {
                data[i].label = locale.get(data[i].locale);
            }
        }
        return data;
    }

    // 渲染所需数据
    resetModalData() {
        const locale = this._plugin.getGlobalContext().getLocale();
        this._modalData.forEach((item) => {
            item.title = locale.get(item.locale);
            if (item.group && item.group.length) {
                item.group.forEach((ele) => {
                    ele.label = locale.get(ele.locale);
                });
            }
        });
        this._numfmtModal.setModal(this._modalData);
    }

    showModal(name: string, show: boolean) {
        const index = this._modalData.findIndex((item) => item.name === name);
        if (index > -1) {
            this._modalData[index].show = show;
            this.resetModalData();
        }
    }

    private _initialize() {
        this._plugin.getObserver('onNumfmtModalDidMountObservable')!.add((component) => {
            this._numfmtModal = component;
            this.resetModalData();
        });
    }

    private _initRegisterComponent() {
        this._sheetPlugin.registerComponent(NUMFMT_PLUGIN_NAME + FormatContent.name, FormatContent);
        this._sheetPlugin.registerModal(NUMFMT_PLUGIN_NAME + NumfmtModal.name, NumfmtModal);
    }
}
