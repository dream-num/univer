import { BaseComponentSheet, BaseIconProps, BaseSingleButtonProps, Component, FunctionComponent, IToolBarItemProps } from '@univer/base-component';
import { PLUGIN_NAMES, Nullable, Observer, Workbook } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';

import { PROTECTION_PLUGIN_NAME } from '../Basic/Const';
import { IProps } from '../IData/IProtection';

// Types for state
interface IState {
    protection: IToolBarItemProps;
}

export class ProtectionButton extends Component<IProps, IState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    SingleButton: FunctionComponent<BaseSingleButtonProps>;

    LockIcon: FunctionComponent<BaseIconProps>;

    initialize(props: IProps) {
        // super();

        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        const render = component.getComponentRender();
        this.SingleButton = render.renderFunction('SingleButton');
        this.LockIcon = render.renderFunction('LockIcon');

        const protection: IToolBarItemProps = {
            locale: 'protection',
            type: 'single',
            label: <this.LockIcon />,
            show: true,
            onClick: () => {
                this._context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.showSiderByName(PROTECTION_PLUGIN_NAME, true);
            },
        };
        this.state = {
            protection,
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
        this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        const locale = this._context.getLocale();
        let item = this.state.protection;
        // set current Locale string for tooltip
        item.tooltip = locale.get(`${item.locale}.${item.locale}Label`);
        this.setState({ protection: item });
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        const { protection } = state;
        // Set Provider for entire Container
        return (
            <this.SingleButton
                tooltip={protection.tooltip}
                key={protection.locale}
                name={protection.locale}
                label={protection.label}
                icon={protection.icon}
                onClick={protection.onClick?.bind(this)}
            ></this.SingleButton>
            // <Select tooltip={protection.tooltip} tooltipRight={protection.tooltipRight} key={protection.name} label={protection.label} onClick={protection.onClick?.bind(this)} />
        );
    }
}
