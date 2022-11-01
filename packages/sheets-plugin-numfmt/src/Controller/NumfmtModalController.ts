import { ComponentChildren } from '@univer/base-component';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { PLUGIN_NAMES } from '@univer/core';
import { NUMFMT_PLUGIN_NAME } from '../Const';
import { CURRENCYDETAIL, DATEFMTLISG } from '../Const/FORMATDETAIL';
import { NumfmtPlugin } from '../NumfmtPlugin';
import { FormatContent } from '../View/UI/FormatContent';
import { NumfmtModal } from '../View/UI/NumfmtModal';

interface GroupProps {
    locale: string;
    label?: string;
    type?: string;
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

export class NumftmModalController {
    private _plugin: NumfmtPlugin;

    private _spreadSheetPlugin: SpreadsheetPlugin;

    private _numfmtModal: NumfmtModal;

    private _modalData: ModalDataProps[];

    constructor(plugin: NumfmtPlugin) {
        this._plugin = plugin;
        this._spreadSheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        const locale = this._plugin.getContext().getLocale();

        this._modalData = [
            {
                name: 'currency',
                locale: 'toolbar.currencyFormat',
                show: false,
                group: [
                    {
                        locale: 'button.cancel',
                        type: 'primary',
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
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
                        locale: 'button.cancel',
                        type: 'primary',
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
                children: {
                    name: NUMFMT_PLUGIN_NAME + FormatContent.name,
                    props: {
                        data: DATEFMTLISG,
                        onClick: (value: string) => console.dir(value),
                    },
                },
            },
        ];

        this.initRegisterComponent();

        this.init();
    }

    init() {
        this._plugin.getObserver('onNumfmtModalDidMountObservable')!.add((component) => {
            this._numfmtModal = component;

            this.resetModalData();
        });
    }

    initRegisterComponent() {
        this._spreadSheetPlugin.registerComponent(NUMFMT_PLUGIN_NAME + FormatContent.name, FormatContent);
        this._spreadSheetPlugin.registerModal(NUMFMT_PLUGIN_NAME + NumfmtModal.name, NumfmtModal);
    }

    resetContentData(data: any[]) {
        const locale = this._plugin.getContext().getLocale();

        for (let i = 0; i < data.length; i++) {
            if (data[i].locale) {
                data[i].label = locale.get(data[i].locale);
            }
        }

        return data;
    }

    // 渲染所需数据
    resetModalData() {
        const locale = this._plugin.getContext().getLocale();

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
}
