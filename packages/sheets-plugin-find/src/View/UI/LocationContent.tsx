import { Component } from '@univerjs/base-ui';

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
    // private _localeObserver: Nullable<Observer<Workbook>>;

    // Render: BaseComponentRender;

    // initialize() {
    //     const component = new SheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
    //     this.Render = component.getComponentRender();
    //     this.state = {
    //         radioGroup: [],
    //         active: '1',
    //     };
    // }

    // handleChange = (value: string) => {
    //     let { radioGroup } = this.state;
    //     radioGroup.forEach((item) => {
    //         if (item.children) {
    //             item.children.forEach((ele) => {
    //                 ele.disabled = true;
    //             });
    //         }
    //     });

    //     radioGroup.forEach((item) => {
    //         if (item.value === value) {
    //             if (item.children) {
    //                 item.children.forEach((ele) => {
    //                     ele.disabled = false;
    //                 });
    //             }
    //             this.setValue({ active: value, radioGroup });
    //         }
    //     });
    // };

    // handleCheckbox = (value: string[], locale: string) => {
    //     let { radioGroup } = this.state;
    //     let index = radioGroup.findIndex((item) => item.locale === locale);
    //     radioGroup[index].children!.forEach((ele) => {
    //         if (value.includes(ele.value)) {
    //             ele.checked = true;
    //         } else {
    //             ele.checked = false;
    //         }
    //     });
    //     this.setValue({ radioGroup });
    // };

    render() {
        // const CheckboxGroup = this.Render.renderFunction('CheckboxGroup');
        // const Radio = this.Render.renderFunction('Radio');
        // const RadioGroup = this.Render.renderFunction('RadioGroup');
        // const { radioGroup, active } = this.state;
        return (
            <div></div>
            // <div className={styles.locationContent}>
            //     <RadioGroup vertical={true} onChange={this.handleChange} active={active}>
            //         {radioGroup.map((item) => {
            //             if (item.children) {
            //                 return (
            //                     <Radio value={item.value} label={item.label}>
            //                         <CheckboxGroup options={item.children} onChange={(value) => this.handleCheckbox(value, item.locale)} />
            //                     </Radio>
            //                 );
            //             }
            //             return <Radio value={item.value} label={item.label}></Radio>;
            //         })}
            //     </RadioGroup>
            // </div>
        );
    }
}
