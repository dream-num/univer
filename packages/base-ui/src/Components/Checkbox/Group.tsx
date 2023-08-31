import { useRef } from 'preact/hooks';
import { JSXComponent } from '../../BaseComponent';
import { BaseCheckboxGroupProps, CheckboxGroupComponent } from '../../Interfaces';
import { Checkbox } from './Checkbox';
import styles from './index.module.less';

// type CheckboxGroupProps = {
//     disabled?: boolean;
//     name?: string;
//     options: Array<options>;
//     onChange?: (value: string[]) => void;
// };

// type options = {
//     checked?: boolean;
//     disabled?: boolean;
//     name?: string;
//     label?: string | JSX.Element;
//     value?: string;
// };

export const CheckboxGroup = (props: BaseCheckboxGroupProps) => {
    const { options, onChange, disabled, name } = props;
    const ref = useRef<HTMLDivElement>(null);

    if (disabled) {
        options.forEach((item) => {
            item.disabled = true;
        });
    }
    if (name) {
        options.forEach((item) => {
            item.name = name;
        });
    }

    const handelChange = () => {
        if (!onChange) return;
        const input = ref.current?.querySelectorAll('label input');
        const value: string[] = [];
        input?.forEach((item) => {
            const element = item as HTMLInputElement;
            if (element.checked) {
                value.push(element.value);
            }
        });
        onChange(value);
    };

    return (
        <div className={styles.checkboxGroup} ref={ref}>
            {options.map((item) => (
                <Checkbox name={item.name} disabled={item.disabled} checked={item.checked} onChange={handelChange} value={item.value}>
                    {item.label}
                </Checkbox>
            ))}
        </div>
    );
};

export class UniverCheckboxGroup implements CheckboxGroupComponent {
    render(): JSXComponent<BaseCheckboxGroupProps> {
        return CheckboxGroup;
    }
}
