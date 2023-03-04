import { ComponentChildren } from '@univerjs/base-ui';
import { SheetPlugin } from '@univerjs/base-sheets';
import { PLUGIN_NAMES } from '@univerjs/core';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { FormulaType, FORMULA_PLUGIN_NAME, FunList, SelectCategoryType } from '../Basic';
import { FormulaPlugin } from '../FormulaPlugin';
import { SearchFormulaContent } from '../View/UI/SearchFormulaModal/SearchFormulaContent';
import { SearchFormulaModal } from '../View/UI/SearchFormulaModal/SearchFormulaModal';
import { SearchItem } from '../View/UI/SearchFormulaModal/SearchItem';

export interface Label {
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
    children?: FormulaType[];
    onClick: (value: FormulaType) => void;
}

export interface FunParams {
    funParams: FormulaType;
}

interface CustomComponent {
    name?: string;
    props: {
        select?: Label[];
        funList?: FunListILabel;
        funParams?: FunParams;
        calcLocale?: string;
        range?: string;
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
                        label: 'button.confirm',
                        type: 'primary',
                        onClick: this.showSearchItemModal.bind(this),
                    },
                    {
                        label: 'button.cancel',
                    },
                ],
                onCancel: () => this.showFormulaModal('SearchFormula', false),
                children: {
                    name: FORMULA_PLUGIN_NAME + SearchFormulaContent.name,
                    props: {
                        select: SelectCategoryType,
                        funList: {
                            onClick: this.selectFunParams.bind(this),
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
                        label: 'button.confirm',
                        type: 'primary',
                    },
                    {
                        label: 'button.cancel',
                    },
                ],
                onCancel: () => this.showFormulaModal('SearchItem', false),
                children: {
                    name: FORMULA_PLUGIN_NAME + SearchItem.name,
                    props: {
                        funParams: this._funParams,
                        calcLocale: 'formula.formulaMore.calculationResult',
                        range: 'A1:B10',
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

        this._initialize();
    }

    selectFunParams(value: FormulaType) {
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
        // const cellRangeModal = sheetPlugin?.getModalGroupControl().getModal(CellRangeModal.name);
        // cellRangeModal.setModal(this._cellRangeModalData);
        this.showFormulaModal('SearchItem', false);
    }

    showSearchItemModal() {
        this.showFormulaModal('SearchFormula', false);
        this.showFormulaModal('SearchItem', true);
    }

    private _initialize() {
        this._initRegisterComponent();

        const sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;
        sheetPlugin.getObserver('onChangeSelectionObserver')?.add((selection) => {
            const info = selection.getCurrentCellInfo();
            // this._searchItem.changeRange(info?.startColumn.toString() ?? '');
        });
    }

    private _initRegisterComponent() {
        const sheetUiPlugin = this._plugin.getContext().getUniver().getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);
        const ComponentManager = sheetUiPlugin.getComponentManager();
        sheetUiPlugin.addSlot(FORMULA_PLUGIN_NAME + SearchFormulaModal.name, {
            component: SearchFormulaModal,
            props: {
                getComponent: (ref: SearchFormulaModal) => {
                    this._formulaModal = ref;
                },
            },
        });
        ComponentManager.register(FORMULA_PLUGIN_NAME + SearchItem.name, SearchItem);
        ComponentManager.register(FORMULA_PLUGIN_NAME + SearchFormulaContent.name, SearchFormulaContent);
    }
}
