import { BaseComponentRender, BaseComponentSheet, Component, IToolBarItemProps } from '@univer/base-component';
import { Nullable, Observer, Workbook } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { PIVOT_TABLE_PLUGIN_NAME } from '../Const/PLUGIN_NAME';
import { IProps } from '../IData/IPivotTable';
import styles from './index.module.less';

// Types for state
interface IState {
    pivotTable: IToolBarItemProps;
    // modalData: Array<ModalProps>;
}

export class PivotTableButton extends Component<IProps, IState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    Render: BaseComponentRender;

    initialize(props: IProps) {
        // super(props);
        const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        const PivotableIcon = this.Render.renderFunction('PivotableIcon');
        const pivotTableState: IToolBarItemProps = {
            locale: PIVOT_TABLE_PLUGIN_NAME,
            type: 'single',
            label: <PivotableIcon />,
            show: true,
        };
        this.state = {
            pivotTable: pivotTableState,
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
        this.setState((prevState: IState) => {
            let item = prevState.pivotTable;
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
                pivotTable: item,
            };
        });
    }

    showPivotTable = () => {};

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        const Button = this.Render.renderFunction('Button');
        const Tooltip = this.Render.renderFunction('Tooltip');
        const { pivotTable } = state;
        // Set Provider for entire Container
        return (
            <div className={styles.singleButton}>
                <Tooltip title={pivotTable.tooltip!} placement={'bottom'}>
                    <Button type="text" onClick={this.showPivotTable}>
                        {pivotTable.label}
                    </Button>
                </Tooltip>
            </div>
        );
    }
}
