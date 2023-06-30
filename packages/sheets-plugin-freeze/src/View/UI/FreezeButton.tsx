// import { BaseComponentRender, BaseComponentSheet, BaseSelectProps, Component, ISelectButton, IToolbarItemProps } from '@univerjs/base-ui';
// import { Nullable, Observer, Workbook } from '@univerjs/core';
// import { SheetPlugin } from '@univerjs/base-sheets';
// import { IConfig } from '../../IData';

// interface IProps {
//     config: IConfig;
// }

// // Types for state
// interface IState {
//     frozen: IToolbarItemProps;
// }

// export class FreezeButton extends Component<IProps, IState> {
//     private _localeObserver: Nullable<Observer<Workbook>>;

//     Render: BaseComponentRender;

//     initialize(props: IProps) {
//         // super(props);
//         const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
//         this.Render = component.getComponentRender();
//         const NextIcon = this.Render.renderFunction('NextIcon');
//         const FreezeIcon = this.Render.renderFunction('FreezeIcon');

//         this.state = {
//             frozen: {
//                 locale: 'frozen',
//                 type: 'select',
//                 label: <FreezeIcon />,
//                 icon: <NextIcon />,
//                 show: true,
//                 border: false,
//                 selectType: ISelectButton.DOUBLE,
//                 needChange: false,
//                 children: [
//                     {
//                         locale: 'frozen.default',
//                     },
//                     {
//                         locale: 'frozen.frozenRow',
//                     },
//                     {
//                         locale: 'frozen.frozenColumn',
//                     },
//                     {
//                         locale: 'frozen.frozenRC',
//                         border: true,
//                     },
//                     {
//                         locale: 'frozen.frozenRowRange',
//                     },
//                     {
//                         locale: 'frozen.frozenColumnRange',
//                     },
//                     {
//                         locale: 'frozen.frozenRCRange',
//                     },
//                     {
//                         locale: 'frozen.frozenCancel',
//                         border: true,
//                     },
//                 ],
//             },
//         };
//     }

//     /**
//      * init
//      */
//     componentWillMount() {
//         this.setLocale();

//         // subscribe Locale change event
//         this._localeObserver = this._context
//             .getObserverManager()
//             .getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')
//             ?.add(() => {
//                 this.setLocale();
//             });
//     }

//     /**
//      * destory
//      */
//     componentWillUnmount() {
//         // this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
//     }

//     /**
//      * set text by config setting and Locale message
//      */
//     setLocale() {
//         const locale = this._context.getLocale();
//         this.setState((prevState: IState) => {
//             let item = prevState.frozen;
//             // set current Locale string for tooltip
//             item.tooltip = locale.get(`frozen.${item.locale}Label`);
//             item.tooltipRight = locale.get(`frozen.${item.locale}RightLabel`);

//             // set current Locale string for select
//             item.children?.forEach((ele: IToolbarItemProps) => {
//                 if (ele.locale) {
//                     ele.label = locale.get(`${ele.locale}`);
//                 }
//             });
//             item.label = typeof item.label === 'object' ? item.label : item.children![0].label;

//             return {
//                 frozen: item,
//             };
//         });
//     }

//     /**
//      * Render the component's HTML
//      *
//      * @returns
//      */
//     render(props: IProps, state: IState) {
//         const Select = this.Render.renderFunction('Select');
//         const { frozen } = state;
//         // Set Provider for entire Container
//         return (
//             <Select
//                 tooltip={frozen.tooltip}
//                 tooltipRight={frozen.tooltipRight}
//                 border={frozen.border}
//                 selectType={frozen.selectType}
//                 needChange={frozen.needChange}
//                 key={frozen.locale}
//                 children={frozen.children as BaseSelectProps[]}
//                 label={frozen.label}
//                 icon={frozen.icon}
//             />
//         );
//     }
// }
