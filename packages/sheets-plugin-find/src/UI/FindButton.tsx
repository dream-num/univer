import { BaseComponentRender, BaseComponentSheet, BaseSelectProps, Component, IToolBarItemProps, ModalProps } from '@univer/base-component';
import { Nullable, Observer, Workbook1 } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { IProps } from '../IData/IFind';
import { LocationContent } from './LocationContent';
import { SearchContent } from './SearchContent';

// Types for state
interface IState {
    find: IToolBarItemProps;
    modalData: ModalProps[];
}

export class FindButton extends Component<IProps, IState> {
    Render: BaseComponentRender;

    private _localeObserver: Nullable<Observer<Workbook1>>;

    active = 'find';

    initialize(props: IProps) {
        // super(props);
        const component = new SpreadsheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();
        const NextIcon = this.Render.renderFunction('NextIcon');
        const SearchIcon = this.Render.renderFunction('SearchIcon');
        const ReplaceIcon = this.Render.renderFunction('ReplaceIcon');
        const LocationIcon = this.Render.renderFunction('LocationIcon');

        this.state = {
            find: {
                locale: 'find.findLabel',
                type: 'select',
                label: <SearchIcon />,
                icon: <NextIcon />,
                show: true,
                tooltip: '',
                children: [
                    {
                        locale: 'find.find',
                        icon: <SearchIcon />,
                        onClick: () => {
                            this.showFind('find');
                        },
                    },
                    {
                        locale: 'find.replace',
                        icon: <ReplaceIcon />,
                        onClick: () => {
                            this.showFind('replace');
                        },
                    },
                    {
                        locale: 'find.location',
                        icon: <LocationIcon />,
                        border: true,
                        onClick: () => {
                            this.showLocation();
                        },
                    },
                    {
                        locale: 'find.formula',
                        iconName: 'find.locationExample',
                        onClick: () => {},
                    },
                    {
                        locale: 'find.date',
                        iconName: 'find.locationExample',
                    },
                    {
                        locale: 'find.number',
                        iconName: 'find.locationExample',
                    },
                    {
                        locale: 'find.string',
                        iconName: 'find.locationExample',
                    },
                    {
                        locale: 'find.error',
                        iconName: 'find.locationExample',
                    },
                    {
                        locale: 'find.condition',
                        iconName: 'find.locationExample',
                    },
                    {
                        locale: 'find.rowSpan',
                        iconName: 'find.locationExample',
                    },
                    {
                        locale: 'find.columnSpan',
                        iconName: 'find.locationExample',
                    },
                ],
            },
            modalData: [
                {
                    locale: 'find.location',
                    show: false,
                    group: [
                        {
                            locale: 'button.confirm',
                            type: 'primary',
                        },
                        {
                            locale: 'button.cancel',
                        },
                    ],
                    children: <LocationContent config={props.config} />,
                    onCancel: () => this.showModal(0, false),
                },
                {
                    locale: 'find.findLabel',
                    show: false,
                    group: [
                        {
                            locale: 'button.cancel',
                        },
                    ],
                    children: <SearchContent config={props.config} activeKey="find" />,
                    onCancel: () => this.showModal(1, false),
                },
            ],
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
            .getObserver<Workbook1>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    /**
     * destory
     */
    componentWillUnmount() {
        this._context.getObserverManager().getObserver<Workbook1>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    /**
     * set text by config setting and Locale message
     */
    setLocale() {
        const locale = this._context.getLocale();
        this.setState((prevState: IState) => {
            let item = prevState.find;
            // set current Locale string for tooltip
            item.tooltip = locale.get(`${item.locale}`);
            // set current Locale string for select
            item.children?.forEach((ele: IToolBarItemProps) => {
                if (ele.locale) {
                    ele.label = locale.get(`${ele.locale}`);
                }
                if (ele.iconName) {
                    ele.icon = locale.get(`${ele.iconName}`);
                }
            });
            item.label = typeof item.label === 'object' ? item.label : item.children![0].label;

            // set current Locale string fro modal
            let { modalData } = prevState;
            modalData.forEach((ele) => {
                ele.title = locale.get(ele.locale!);
                if (ele.group && ele.group.length) {
                    ele.group.forEach((node) => {
                        node.label = locale.get(node.locale!);
                    });
                }
            });

            return {
                find: item,
                modalData,
            };
        });
    }

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    /**
     * @param index modal index
     * @param isShow
     */
    showModal = (index: number, isShow: boolean) => {
        this.setState((prevState) => {
            let { modalData } = prevState;

            modalData[index].show = isShow;
            return {
                modalData,
            };
        });
    };

    // show location modal
    showLocation = () => {
        this.showModal(0, true);
    };

    // show findandreplace modal
    showFind = (name: string) => {
        let { modalData } = this.state;
        modalData[1].children = <SearchContent config={this.props.config} activeKey={name} />;
        this.setValue({ modalData });
        this.showModal(1, true);
    };

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IProps, state: IState) {
        const Modal = this.Render.renderFunction('Modal');
        const Select = this.Render.renderFunction('Select');
        const { find, modalData } = state;
        // Set Provider for entire Container
        return (
            <>
                <Select tooltip={find.tooltip} key={find.locale} children={find.children as BaseSelectProps[]} label={find.label} icon={find.icon} />
                {modalData.map((item) => {
                    if (!item.show) return;
                    return (
                        <Modal title={item.title} visible={item.show} group={item.group} onCancel={item.onCancel}>
                            {item.children}
                        </Modal>
                    );
                })}
            </>
        );
    }
}
