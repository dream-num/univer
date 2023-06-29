import { Component } from '@univerjs/base-ui';
import { Nullable, Observer, Workbook } from '@univerjs/core';
import { ComponentChild, RenderableProps } from 'preact';
import { IProps } from '../IData/IProtection';

// Types for state
// interface IState {
//     protection: IToolbarItemProps;
// }

export class ProtectionButton extends Component<IProps> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    // SingleButton: FunctionComponent<BaseSingleButtonProps>;
    //
    // LockIcon: FunctionComponent<BaseIconProps>;

    initialize(props: IProps) {
        // super();
        // const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        // const render = component.getComponentRender();
        // this.SingleButton = render.renderFunction('SingleButton');
        // this.LockIcon = render.renderFunction('LockIcon');
        //
        // const protection: IToolbarItemProps = {
        //     locale: 'protection',
        //     type: 'single',
        //     label: <this.LockIcon />,
        //     show: true,
        //     onClick: () => {
        //         this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.showSiderByName(PROTECTION_PLUGIN_NAME, true);
        //     },
        // };
        // this.state = {
        //     protection,
        // };
    }

    /**
     * init
     */
    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event

        this._localeObserver = this.getContext()
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
        // const locale = this.getContext().getLocale();
        // let item = this.state.protection;
        // // set current Locale string for tooltip
        // item.tooltip = locale.get(`${item.locale}.${item.locale}Label`);
        // this.setState({ protection: item });
    }

    render(props: RenderableProps<IProps> | undefined, state: Readonly<{}> | undefined, context: any): ComponentChild {
        return undefined;
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    // render(props: IProps, state: IState) {
    //     const { protection } = state;
    //     // Set Provider for entire Container
    //     return (
    //         <SingleButton
    //             tooltip={protection.tooltip}
    //             key={protection.locale}
    //             name={protection.locale}
    //             label={protection.label}
    //             icon={protection.icon}
    //             onClick={protection.onClick?.bind(this)}
    //         ></SingleButton>
    //         // <Select tooltip={protection.tooltip} tooltipRight={protection.tooltipRight} key={protection.name} label={protection.label} onClick={protection.onClick?.bind(this)} />
    //     );
    // }
}
