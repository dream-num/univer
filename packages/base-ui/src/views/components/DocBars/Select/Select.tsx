import { Dropdown } from '@univerjs/design';
import { MoreDownSingle } from '@univerjs/icons';

import { NeoCustomLabel } from '../../../../components/custom-label/CustomLabel';
import { Menu } from '../../../../components/menu/Menu';
import { IValueOption } from '../../../../services/menu/menu';
import styles from './index.module.less';

interface IProps {
    label?:
        | string
        | {
              name: string;
              props?: Record<string, string | number>;
          };
    className?: string;
    name?: string;
    value?: string | number;
    icon?: string;
    id?: string;
    options?: IValueOption[];
    title?: string;
    onClick?: (option: IValueOption | number | string) => void;
}

export function Select(props: IProps) {
    const { onClick, ...restProps } = props;
    const { value, icon, title, id, label, options } = restProps;

    const onOptionSelect = (option: IValueOption) => {
        onClick?.(option);
    };

    const iconToDisplay = options?.find((o) => o.value === value)?.icon ?? icon;

    return (
        <div className={styles.selectComponent}>
            <div className={styles.selectDouble}>
                <Dropdown
                    {...restProps}
                    overlay={<Menu menuType={id} options={options} onOptionSelect={onOptionSelect} value={value} />}
                >
                    <div className={styles.selectLabel}>
                        <NeoCustomLabel
                            icon={iconToDisplay}
                            title={title!}
                            value={value}
                            label={label}
                            onChange={(v) => onClick?.(v)}
                        />
                        <div className={styles.selectDropIcon}>
                            <MoreDownSingle />
                        </div>
                    </div>
                </Dropdown>
            </div>
        </div>
    );
}
