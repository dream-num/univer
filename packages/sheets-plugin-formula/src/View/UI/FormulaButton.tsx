import { BaseComponentSheet, BaseIconProps, BaseSelectProps, Component, FunctionComponent, ISelectButton, ISlotElement } from '@univer/base-component';
import { IToolBarItemProps } from '@univer/base-sheets';
import { Nullable, Observer, Workbook } from '@univer/core';
import { FORMULA_CHILDREN } from '../../Basic';
import { IProps } from '../../Basic/Interfaces';
import { IfGenerate } from './IfGenerate';
import { SearchFormulaModal } from './SearchFormulaModal';

// Types for state
interface IState {
    formula: IToolBarItemProps;
    searchMoadal: boolean;
    ifModal: boolean;
    locale: string;
    functionList: any;
}

// const formula = {
//     name: 'formula',
//     type: ISlotElement.SELECT,
//     label: <Icon.Data.SumIcon />,
//     icon: <Icon.Format.NextIcon />,
//     show: true,
//     selectType: ISelectButton.DOUBLE,
//     border: false,
//     onClick: () => {},
//     children: FORMULA_CHILDREN,
// };

export class FormulaButton extends Component<IProps, IState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    SumIcon: FunctionComponent<BaseIconProps>;

    NextIcon: FunctionComponent<BaseIconProps>;

    Select: FunctionComponent<BaseSelectProps>;

    initialize(props: IProps) {
        // super(props);
        const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        const render = component.getComponentRender();
        this.SumIcon = render.renderFunction('SumIcon');
        this.NextIcon = render.renderFunction('NextIcon');
        this.Select = render.renderFunction('Select');
        const { SumIcon, NextIcon } = this;
        this.state = {
            functionList: null,
            searchMoadal: false,
            ifModal: false,
            locale: '',
            formula: {
                locale: 'formula',
                type: ISlotElement.SELECT,
                label: <SumIcon />,
                icon: <NextIcon />,
                show: true,
                selectType: ISelectButton.DOUBLE,
                border: false,
                onClick: () => {},
                children: FORMULA_CHILDREN,
            },
        };
    }

    /**
     * init
     */
    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event

        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });

        this.state.formula.children?.forEach((item) => {
            if (item.locale === 'formula.if') {
                item.onClick = this.modalShow.bind(this, 'ifModal');
            } else if (item.locale === 'formula.more') {
                item.onClick = this.modalShow.bind(this, 'searchMoadal');
            }
        });
    }

    /**
     * destory
     */
    componentWillUnmount() {
        // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        const locale = this._context.getLocale();

        const currentLocale = locale.options.currentLocale;
        const functionList = locale.options.locales[currentLocale].functionlist;

        this.setState((prevState: IState) => {
            let item = prevState.formula;
            // set current Locale string for tooltip
            item.tooltip = locale.get(`${item.locale}Label`);
            item.tooltipRight = locale.get(`${item.locale}RightLabel`);
            // set current Locale string for select
            item.children?.forEach((ele: IToolBarItemProps) => {
                if (ele.locale) {
                    ele.label = locale.get(`${ele.locale}`);
                }
            });
            item.label = typeof item.label === 'object' ? item.label : item.children![0].label;

            return {
                formula: item,
                functionList,
            };
        });
    }

    /**
     *
     * @param {string} type  searchMoadal || ifModal
     */
    modalShow(type: string) {
        let state = {
            [type]: true,
        };
        this.setState((prevState) => state);
    }

    modalHide(e: Event) {
        const container = document.getElementsByClassName('univer-modal-wrapper')[0] || document;
        const close = document.getElementsByClassName('univer-modal-close')[0] || document;
        if ((this.state.searchMoadal || this.state.ifModal) && (container.contains(e.target as Element) || close.contains(e.target as Element))) {
            this.setState({
                searchMoadal: false,
                ifModal: false,
            });
        }
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const { formula } = state;
        // Set Provider for entire Container
        // console.log(this.state.functionList);
        const { Select } = this;
        return (
            <>
                <Select
                    tooltip={formula.tooltip}
                    tooltipRight={formula.tooltipRight}
                    selectType={formula.selectType}
                    label={formula.label}
                    icon={formula.icon}
                    border={formula.border}
                    onClick={formula.onClick}
                    key={formula.locale}
                    children={formula.children as BaseSelectProps[]}
                />
                <SearchFormulaModal config={this.props.config} visible={this.state.searchMoadal} onOk={() => {}} onCancel={this.modalHide.bind(this)}></SearchFormulaModal>
                <IfGenerate config={this.props.config} visible={this.state.ifModal} onOk={() => {}} onCancel={this.modalHide.bind(this)}></IfGenerate>
            </>
        );
    }
}
