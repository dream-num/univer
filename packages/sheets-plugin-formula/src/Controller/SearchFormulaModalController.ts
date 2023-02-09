import { ComponentChildren } from '@univerjs/base-ui';
import { SheetPlugin, CellRangeModal } from '@univerjs/base-sheets';
import { PLUGIN_NAMES } from '@univerjs/core';
import { FORMULA_PLUGIN_NAME, FunctionList, FunList, SelectCategoryType } from '../Basic';
import { FormulaPlugin } from '../FormulaPlugin';
import { SearchFormulaContent } from '../View/UI/SearchFormulaModal/SearchFormulaContent';
import { SearchFormulaModal } from '../View/UI/SearchFormulaModal/SearchFormulaModal';
import { SearchItem } from '../View/UI/SearchFormulaModal/SearchItem';

interface Label {
    type?: string;
    locale?: string;
    label?: string;
    placeholderLocale?: string;
    placeholder?: string;
}

export interface ILabel extends Label {
    children?: Label[];
    onClick?: () => void;
}

export interface FunListILabel extends Label {
    children?: FunctionList[];
    onClick: (value: FunctionList) => void;
}

export interface FunParams {
    funParams: FunctionList;
}

interface CustomComponent {
    name?: string;
    props: {
        input?: ILabel;
        select?: ILabel;
        funList?: FunListILabel;
        funParams?: FunParams;
        calcLocale?: string;
        range?: string;
        onTableClick?: () => void;
        placeholderLocale?: string;
        titleLocale?: string;
        confirmTextLocale?: string;
    };
}

export interface SearchFormulaModalData {
    name: string;
    label?: FunParams;
    show?: boolean;
    mask?: boolean;
    group: ILabel[];
    titleLocale?: string;
    onCancel?: () => void;
    children: CustomComponent;
    modal?: ComponentChildren; // 渲染的组件
}

export class SearchFormulaController {
    private _plugin: FormulaPlugin;

    private _modalData: SearchFormulaModalData[];

    private _formulaModal: SearchFormulaModal;

    private _searchItem: SearchItem;

    private _funParams: FunParams;

    private _cellRangeModalData: SearchFormulaModalData;

    constructor(plugin: FormulaPlugin) {
        this._plugin = plugin;

        this._funParams = {
            funParams: {},
        };

        this._modalData = [
            {
                name: 'SearchFormula',
                show: false,
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                        onClick: this.showSearchItemModal.bind(this),
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
                onCancel: () => this.showFormulaModal('SearchFormula', false),
                children: {
                    name: FORMULA_PLUGIN_NAME + SearchFormulaContent.name,
                    props: {
                        input: {
                            locale: 'formula.formulaMore.findFunctionTitle',
                            placeholderLocale: 'formula.formulaMore.tipInputFunctionName',
                        },
                        select: {
                            locale: 'formula.formulaMore.selectCategory',
                            children: SelectCategoryType,
                        },
                        funList: {
                            onClick: this.selectFunParams.bind(this),
                            locale: 'formula.formulaMore.selectFunctionTitle',
                            children: FunList,
                        },
                    },
                },
            },
            {
                name: 'SearchItem',
                label: this._funParams,
                show: false,
                mask: false,
                group: [
                    {
                        locale: 'button.confirm',
                        type: 'primary',
                    },
                    {
                        locale: 'button.cancel',
                    },
                ],
                onCancel: () => this.showFormulaModal('SearchItem', false),
                children: {
                    name: FORMULA_PLUGIN_NAME + SearchItem.name,
                    props: {
                        funParams: this._funParams,
                        calcLocale: 'formula.formulaMore.calculationResult',
                        range: 'A1:B10',
                        onTableClick: () => this.showCellRangeModal(true),
                    },
                },
            },
        ];

        this._cellRangeModalData = {
            name: 'cellRangeModal',
            titleLocale: 'formula.formulaMore.tipSelectDataRange',
            show: false,
            mask: false,
            group: [
                {
                    locale: 'button.confirm',
                    type: 'primary',
                },
            ],
            onCancel: () => this.showFormulaModal('cellRangeModal', false),
            children: {
                props: {
                    placeholderLocale: '',
                },
            },
        };

        // this._initRegisterComponent();

        this._initialize();
    }

    private _initialize() {
        this._plugin.getObserver('onSearchFormulaModalDidMountObservable')!.add((component) => {
            this._formulaModal = component;

            this._modalData = this._resetLabel(this._modalData);
            this._cellRangeModalData = this._resetLabel(this._cellRangeModalData);
        });

        this._plugin.getObserver('onSearchItemDidMountObservable')!.add((component) => {
            this._searchItem = component;
        });

        const sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        sheetPlugin.getObserver('onChangeSelectionObserver')?.add((selection) => {
            const info = selection.getCurrentCellInfo();
            // this._searchItem.changeRange(info?.startColumn.toString() ?? '');
        });
    }

    private _initRegisterComponent() {
        const sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        sheetPlugin.registerModal(FORMULA_PLUGIN_NAME + SearchFormulaModal.name, SearchFormulaModal);
        sheetPlugin.registerModal(FORMULA_PLUGIN_NAME + SearchItem.name, SearchItem);
        sheetPlugin.registerComponent(FORMULA_PLUGIN_NAME + SearchFormulaContent.name, SearchFormulaContent);
    }

    private _resetLocale(label: string[] | string) {
        const locale = this._plugin.context.getLocale();

        let str = '';

        if (label instanceof Array) {
            label.forEach((item) => {
                if (item.includes('.')) {
                    str += locale.get(item);
                } else {
                    str += item;
                }
            });
        } else {
            if (label.includes('.')) {
                str = locale.get(label);
            } else {
                str += label;
            }
        }

        return str;
    }

    private _findLocale(obj: any) {
        for (let k in obj) {
            if (k === 'locale') {
                obj.label = this._resetLocale(obj[k]);
            } else if (k.endsWith('Locale')) {
                const index = k.indexOf('Locale');
                obj[k.slice(0, index)] = this._resetLocale(obj[k]);
            } else if (!obj[k].$$typeof) {
                if (Object.prototype.toString.call(obj[k]) === '[object Object]') {
                    this._findLocale(obj[k]);
                } else if (Object.prototype.toString.call(obj[k]) === '[object Array]') {
                    this._resetLabel(obj[k]);
                }
            }
        }

        return obj;
    }

    private _resetLabel(list: any) {
        if (list instanceof Array) {
            for (let i = 0; i < list.length; i++) {
                let item = list[i];

                item = this._findLocale(item);

                if (item.children) {
                    item.children = this._resetLabel(item.children);
                }
            }

            return list;
        }
        if (list instanceof Object) {
            list = this._findLocale(list);
            // for (let k in list) {
            //     list[k] = this._findLocale(list[k]);
            // }
            return list;
        }
    }

    selectFunParams(value: FunctionList) {
        this._funParams.funParams = value;
    }

    showFormulaModal(name: string, show: boolean) {
        const index = this._modalData.findIndex((item) => item.name === name);
        if (index > -1) {
            this._modalData[index].show = show;

            this._formulaModal.setModal(this._modalData);
        }
    }

    showCellRangeModal(show: boolean) {
        this._cellRangeModalData.show = show;
        const sheetPlugin = this._plugin.getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);
        const cellRangeModal = sheetPlugin?.getModalGroupControl().getModal(CellRangeModal.name);
        cellRangeModal.setModal(this._cellRangeModalData);
        this.showFormulaModal('SearchItem', false);
    }

    showSearchItemModal() {
        this.showFormulaModal('SearchFormula', false);
        this.showFormulaModal('SearchItem', true);
    }
}
