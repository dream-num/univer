import { BaseComponentSheet, BaseIconProps, BaseSelectProps, Component, IToolBarItemProps } from '@univer/base-component';
import { Nullable, Observer, WorkBook } from '@univer/core';
import { FunctionComponent } from 'preact';
import { IProps } from '../IData/IPrint';
import { PrintMode } from './PrintMode';
// Types for state
interface IState {
    print: IToolBarItemProps;
    isPrintShow: boolean;
}

export class PrintButton extends Component<IProps, IState> {
    Select: FunctionComponent<BaseSelectProps>;

    PrintIcon: FunctionComponent<BaseIconProps>;

    NextIcon: FunctionComponent<BaseIconProps>;

    PrintAreaIcon: FunctionComponent<BaseIconProps>;

    PrintTitleIcon: FunctionComponent<BaseIconProps>;

    private _localeObserver: Nullable<Observer<WorkBook>>;

    initialize(props: IProps) {
        // super(props);
        const component = this.props.config.context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        const render = component.getComponentRender();
        this.Select = render.renderFunction('Select');
        this.PrintIcon = render.renderFunction('PrintIcon');
        this.NextIcon = render.renderFunction('NextIcon');
        this.PrintAreaIcon = render.renderFunction('PrintAreaIcon');
        this.PrintTitleIcon = render.renderFunction('PrintTitleIcon');

        this.state = {
            isPrintShow: false,
            print: {
                locale: 'print',
                type: 'select',
                label: <this.PrintIcon />,
                show: true,
                icon: <this.NextIcon />,
                children: [
                    {
                        locale: 'print.menuItemPrint',
                        icon: <this.PrintIcon />,
                        onClick: this.setPrintShow.bind(this),
                    },
                    {
                        locale: 'print.menuItemAreas',
                        icon: <this.PrintAreaIcon />,
                        border: true,
                    },
                    {
                        locale: 'print.menuItemRows',
                        icon: <this.PrintTitleIcon />,
                    },
                    {
                        locale: 'print.menuItemColumns',
                        icon: <this.PrintTitleIcon />,
                    },
                ],
            },
        };
    }

    setPrintShow() {
        this.setState({ isPrintShow: true });
    }

    setPrintHide() {
        this.setState({ isPrintShow: false });
    }

    /**
     * init
     */
    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event

        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    /**
     * destory
     */
    componentWillUnmount() {
        this._context.getObserverManager().getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        const locale = this._context.getLocale();
        this.setState((prevState: IState) => {
            let item = prevState.print;
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
                print: item,
            };
        });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        const { print, isPrintShow } = state;
        const { Select } = this;
        // Set Provider for entire Container
        return (
            <>
                <Select tooltip={print.tooltip} key={print.locale} label={print.label} icon={print.icon} children={print.children as BaseSelectProps[]} />
                <PrintMode config={this.props.config} visible={isPrintShow} onCancel={this.setPrintHide.bind(this)}></PrintMode>
            </>
        );
    }
}
