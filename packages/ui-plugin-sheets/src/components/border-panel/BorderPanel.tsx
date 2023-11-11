import { ComponentManager } from '@univerjs/base-ui';
import { useDependency } from '@wendellhu/redi/react-bindings';

import styles from './index.module.less';
import { IBorderPanelProps } from './interface';

export const BORDER_LINE_CHILDREN = [
    {
        label: 'borderLine.borderTop',
        icon: 'UpBorderSingle',
        value: 'top',
    },
    {
        label: 'borderLine.borderBottom',
        icon: 'DownBorderSingle',
        value: 'bottom',
    },
    {
        label: 'borderLine.borderLeft',
        icon: 'LeftBorderSingle',
        value: 'left',
    },
    {
        label: 'borderLine.borderRight',
        icon: 'RightBorderSingle',
        value: 'right',
    },
    {
        label: 'borderLine.borderNone',
        icon: 'NoBorderSingle',
        value: 'none',
    },
    {
        label: 'borderLine.borderAll',
        icon: 'AllBorderSingle',
        value: 'all',
    },
    {
        label: 'borderLine.borderOutside',
        icon: 'OuterBorderSingle',
        value: 'outside',
    },
    {
        label: 'borderLine.borderInside',
        icon: 'InnerBorderSingle',
        value: 'inside',
    },
    {
        label: 'borderLine.borderHorizontal',
        icon: 'InnerBorderSingle',
        value: 'horizontal',
    },
    {
        label: 'borderLine.borderVertical',
        icon: 'InnerBorderSingle',
        value: 'vertical',
    },
];

export function BorderPanel(props: IBorderPanelProps) {
    const componentManager = useDependency(ComponentManager);
    const { onChange } = props;

    function handleClick(value: string) {
        onChange?.(value);
    }

    function renderIcon(icon: string) {
        const Icon = componentManager.get(icon);

        return Icon && <Icon extend={{ colorChannel1: 'rgb(var(--primary-color))' }} />;
    }

    return (
        <section className={styles.uiPluginSheetsBorderPanel}>
            {BORDER_LINE_CHILDREN.map((item) => (
                <div
                    key={item.value}
                    className={styles.uiPluginSheetsBorderPanelItem}
                    onClick={() => handleClick(item.value)}
                >
                    {renderIcon(item.icon)}
                    <span>{item.label}</span>
                </div>
            ))}
        </section>
    );
}
