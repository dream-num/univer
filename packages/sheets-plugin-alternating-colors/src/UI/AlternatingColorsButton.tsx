import { Component, IToolBarItemProps } from '@univerjs/base-component';

import { SheetContext, Nullable, Observer, PLUGIN_NAMES, Workbook } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';

import { ALTERNATING_COLORS_PLUGIN_NAME } from '../Const';
import { IProps } from '../IData/IAlternatingColors';

// Types for state
interface IState {
    alternatingColors: IToolBarItemProps;
}

export class AlternatingColorsButton extends Component<IProps, IState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    initialize(props: IProps) {
        const OrderIcon = this.getComponentRender().renderFunction('OrderIcon');

        // this.SingleButton = renderComponent.renderFunction<SingleButtonComponent>('SingleButton');

        const alternatingColors: IToolBarItemProps = {
            locale: ALTERNATING_COLORS_PLUGIN_NAME,
            type: 'single',
            label: <OrderIcon />,
            show: true,
            onClick: (item, context: SheetContext) => {
                context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.showSiderByName(ALTERNATING_COLORS_PLUGIN_NAME, true);
            },
        };

        this.state = {
            alternatingColors,
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
            let item = prevState.alternatingColors;
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
                alternatingColors: item,
            };
        });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        const { alternatingColors } = state;
        // Set Provider for entire Container
        const SingleButton = this.getComponentRender().renderFunction('SingleButton');
        return (
            <SingleButton
                tooltip={alternatingColors.tooltip}
                key={alternatingColors.locale}
                name={alternatingColors.locale}
                label={alternatingColors.label}
                onClick={alternatingColors.onClick?.bind(this)}
            ></SingleButton>
        );
    }
}
