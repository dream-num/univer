import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';
import { Nullable, Observer, Workbook } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import styles from './index.module.less';

type LocationProps = {
    config: any;
};
type LocationState = {
    radioGroup: LabelProps[];
    active: string | number;
};
type LabelProps = {
    locale: string;
    label?: string;
    value: string;
    disabled?: boolean;
    children?: LabelProps[];
    checked?: boolean;
};

export class LocationContent extends Component<LocationProps, LocationState> {
    private _localeObserver: Nullable<Observer<Workbook>>;

    Render: BaseComponentRender;

    initialize() {
        const component = new SpreadsheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();
        this.state = {
            radioGroup: [
                {
                    locale: 'find.locationConstant',
                    children: [
                        {
                            locale: 'find.date',
                            disabled: true,
                            checked: true,
                            value: '1',
                        },
                        {
                            locale: 'find.number',
                            checked: true,
                            value: '2',
                        },
                        {
                            locale: 'find.string',
                            checked: true,
                            value: '3',
                        },
                        {
                            locale: 'find.locationBool',
                            checked: true,
                            disabled: true,
                            value: '4',
                        },
                        {
                            locale: 'find.error',
                            checked: true,
                            value: '5',
                        },
                    ],
                    value: '1',
                },
                {
                    locale: 'find.locationFormula',
                    children: [
                        {
                            locale: 'find.date',
                            checked: true,
                            disabled: true,
                            value: '1',
                        },
                        {
                            locale: 'find.number',
                            disabled: true,
                            checked: true,
                            value: '2',
                        },
                        {
                            locale: 'find.string',
                            disabled: true,
                            checked: true,
                            value: '3',
                        },
                        {
                            locale: 'find.locationBool',
                            checked: true,
                            disabled: true,
                            value: '4',
                        },
                        {
                            locale: 'find.error',
                            checked: true,
                            disabled: true,
                            value: '5',
                        },
                    ],
                    value: '2',
                },
                {
                    locale: 'find.locationNull',
                    value: '3',
                },
                {
                    locale: 'find.locationCondition',
                    value: '4',
                },
                {
                    locale: 'find.locationRowSpan',
                    value: '5',
                },
                {
                    locale: 'find.locationColumnSpan',
                    value: '6',
                },
            ],
            active: '1',
        };
    }

    setLocale() {
        const locale = this._context.getLocale();
        this.setState((prevState) => {
            let { radioGroup } = prevState;
            radioGroup.forEach((item) => {
                item.label = locale.get(item.locale);
                if (item.children) {
                    item.children.forEach((ele) => {
                        ele.label = locale.get(ele.locale);
                    });
                }
            });

            return {
                radioGroup,
            };
        });
    }

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

    componentWillUnmount() {
        this._context.getObserverManager().getObserver<Workbook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    handleChange = (value: string) => {
        let { radioGroup } = this.state;
        radioGroup.forEach((item) => {
            if (item.children) {
                item.children.forEach((ele) => {
                    ele.disabled = true;
                });
            }
        });

        radioGroup.forEach((item) => {
            if (item.value === value) {
                if (item.children) {
                    item.children.forEach((ele) => {
                        ele.disabled = false;
                    });
                }
                this.setValue({ active: value, radioGroup });
            }
        });
    };

    handleCheckbox = (value: string[], locale: string) => {
        let { radioGroup } = this.state;
        let index = radioGroup.findIndex((item) => item.locale === locale);
        radioGroup[index].children!.forEach((ele) => {
            if (value.includes(ele.value)) {
                ele.checked = true;
            } else {
                ele.checked = false;
            }
        });
        this.setValue({ radioGroup });
    };

    render(props: LocationProps, state: LocationState) {
        const CheckboxGroup = this.Render.renderFunction('CheckboxGroup');
        const Radio = this.Render.renderFunction('Radio');
        const RadioGroup = this.Render.renderFunction('RadioGroup');
        const { radioGroup, active } = state;
        return (
            <div className={styles.locationContent}>
                <RadioGroup vertical={true} onChange={this.handleChange} active={active}>
                    {radioGroup.map((item) => {
                        if (item.children) {
                            return (
                                <Radio value={item.value} label={item.label}>
                                    <CheckboxGroup options={item.children} onChange={(value) => this.handleCheckbox(value, item.locale)} />
                                </Radio>
                            );
                        }
                        return <Radio value={item.value} label={item.label}></Radio>;
                    })}
                </RadioGroup>
            </div>
        );
    }
}
