import { BaseComponentRender, ComponentChildren } from '@univer/base-component';
import { SheetPlugin } from '@univer/base-sheets';
import { PLUGIN_NAMES } from '@univer/core';
import { FIND_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { FindPlugin } from '../FindPlugin';
import { FindModal } from '../View/UI/FindModal';
import { SearchContent } from '../View/UI/SearchContent';

interface GroupProps {
    locale: string;
    label?: string;
    type?: string;
}

export interface ModalDataProps {
    name: string;
    title?: string;
    locale: string;
    show: boolean;
    children: ComponentChildren | string;
    onCancel: () => void;
    group: GroupProps[];
}

export class FindModalController {
    private _plugin: FindPlugin;

    private _render: BaseComponentRender;

    private _findModal: FindModal;

    private _sheetPlugin: SheetPlugin;

    private _modalData: ModalDataProps[];

    constructor(plugin: FindPlugin) {
        this._plugin = plugin;
        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._modalData = [
            // {
            //     locale: 'find.location',
            //     show: false,
            // group: [
            //     {
            //         locale: 'button.confirm',
            //         type: 'primary',
            //     },
            //     {
            //         locale: 'button.cancel',
            //     },
            // ],
            // children: <LocationContent config={props.config} />,
            // onCancel: () => this.showModal(0, false),
            // },
            {
                name: 'find',
                locale: 'find.findLabel',
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
                children: FIND_PLUGIN_NAME + SearchContent.name,
                onCancel: () => {},
            },
        ];

        this._initRegisterComponent();

        this.init();
    }

    init() {
        const plugin = this._sheetPlugin.getPluginByName<FindPlugin>(FIND_PLUGIN_NAME)!;

        plugin.getObserver('onFindModalDidMountObservable')!.add((component) => {
            this._findModal = component;

            this.resetModalData();
        });
    }

    // 注册自定义组件
    private _initRegisterComponent() {
        this._sheetPlugin.registerModal(FIND_PLUGIN_NAME + FindModal.name, 100, FindModal);
        this._sheetPlugin.registerComponent(FIND_PLUGIN_NAME + SearchContent.name, SearchContent, { activeKey: 'find' });
    }

    // 转化为渲染数据
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

        this._findModal.setModal(this._modalData);
    }

    // 显示/关闭弹窗
    showModal(name: string, show: boolean) {
        const index = this._modalData.findIndex((item) => item.name === name);
        if (index > -1) {
            this._modalData[index].show = show;

            this._findModal.setModal(this._modalData);
        }
    }
}
