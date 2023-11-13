import { ComponentManager } from '@univerjs/base-ui';
import { BorderStyleTypes } from '@univerjs/core';
import { ColorPicker, Dropdown, Menu, MenuItem } from '@univerjs/design';
import { MoreDownSingle, PaintBucket } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';

import { BorderLine } from './border-line/BorderLine';
import styles from './index.module.less';
import { BorderPanelType, IBorderPanelProps } from './interface';

const BORDER_LINE_CHILDREN = [
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

const BORDER_SIZE_CHILDREN = [
    {
        label: BorderStyleTypes.THIN,
        value: BorderStyleTypes.THIN,
    },
    {
        label: BorderStyleTypes.HAIR,
        value: BorderStyleTypes.HAIR,
    },
    {
        label: BorderStyleTypes.DOTTED,
        value: BorderStyleTypes.DOTTED,
    },
    {
        label: BorderStyleTypes.DASHED,
        value: BorderStyleTypes.DASHED,
    },
    {
        label: BorderStyleTypes.DASH_DOT,
        value: BorderStyleTypes.DASH_DOT,
    },
    {
        label: BorderStyleTypes.DASH_DOT_DOT,
        value: BorderStyleTypes.DASH_DOT_DOT,
    },
    {
        label: BorderStyleTypes.MEDIUM,
        value: BorderStyleTypes.MEDIUM,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASHED,
        value: BorderStyleTypes.MEDIUM_DASHED,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASH_DOT,
        value: BorderStyleTypes.MEDIUM_DASH_DOT,
    },
    {
        label: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
        value: BorderStyleTypes.MEDIUM_DASH_DOT_DOT,
    },
    {
        label: BorderStyleTypes.THICK,
        value: BorderStyleTypes.THICK,
    },
];

export function BorderPanel(props: IBorderPanelProps) {
    const componentManager = useDependency(ComponentManager);
    const { panelType, onChange } = props;

    function handleClick(item: { value: string | number }, type: BorderPanelType) {
        const { id } = panelType.find((item) => item.type === type) ?? {};

        if (id) {
            onChange?.({
                id,
                value: item.value,
            });
        }
    }

    function renderIcon(icon: string) {
        const Icon = componentManager.get(icon);

        return Icon && <Icon extend={{ colorChannel1: 'rgb(var(--primary-color))' }} />;
    }

    return (
        <section className={styles.uiPluginSheetsBorderPanel}>
            <div className={styles.uiPluginSheetsBorderPanelPosition}>
                {BORDER_LINE_CHILDREN.map((item) => (
                    <div
                        key={item.value}
                        className={styles.uiPluginSheetsBorderPanelPositionItem}
                        onClick={() => handleClick(item, BorderPanelType.POSITION)}
                    >
                        {renderIcon(item.icon)}
                    </div>
                ))}
            </div>

            <div className={styles.uiPluginSheetsBorderPanelStyles}>
                <div>
                    <Dropdown
                        align={{
                            offset: [0, 18],
                        }}
                        overlay={
                            <section className={styles.uiPluginSheetsBorderPanelBoard}>
                                <ColorPicker onChange={(value) => handleClick({ value }, BorderPanelType.COLOR)} />
                            </section>
                        }
                    >
                        <a className={styles.uiPluginSheetsBorderPanelButton} onClick={(e) => e.stopPropagation()}>
                            <PaintBucket extend={{ colorChannel1: 'rgb(var(--primary-color))' }} />
                            <span className={styles.uiPluginSheetsBorderPanelMoreIcon}>
                                <MoreDownSingle />
                            </span>
                        </a>
                    </Dropdown>
                </div>

                <div>
                    <Dropdown
                        align={{
                            offset: [0, 18],
                        }}
                        overlay={
                            <Menu>
                                {BORDER_SIZE_CHILDREN.map((item) => (
                                    <MenuItem
                                        key={item.value}
                                        eventKey={item.value.toString()}
                                        onClick={() => handleClick({ value: item.value }, BorderPanelType.STYLE)}
                                    >
                                        <BorderLine type={item.value} />
                                    </MenuItem>
                                ))}
                            </Menu>
                        }
                    >
                        <a className={styles.uiPluginSheetsBorderPanelButton} onClick={(e) => e.stopPropagation()}>
                            <BorderLine type={BorderStyleTypes.THIN} />
                            <span className={styles.uiPluginSheetsBorderPanelMoreIcon}>
                                <MoreDownSingle />
                            </span>
                        </a>
                    </Dropdown>
                </div>
            </div>
        </section>
    );
}
