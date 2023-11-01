import { LocaleService } from '@univerjs/core';
import { CheckMarkSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { JSX } from 'react';

import { ComponentManager, ICustomComponent } from '../../Common';
import { IMenuSelectorItem } from '../../services/menu/menu';
import { Input } from '../Input';
import { DisplayTypes } from '../Select';
import styles from './CustomLabel.module.less';

export interface IBaseCustomLabelProps {
    icon?: string;
    value?: string;
    label: string | ICustomComponent | React.ReactNode;
    display?: DisplayTypes;
    onChange?: (e: Event) => void;
    selected?: boolean;
    title?: string;
}

export interface INeoCustomLabelProps {
    value?: string | number | undefined;
    selected?: boolean;
    /**
     * Triggered after value change
     */
    onChange?(v: string | number): void;
    /**
     * Triggered after input Enter or Blur
     */
    onValueChange?(v: string | number): void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
}

/**
 * The component to render toolbar item label and menu item label.
 * @param props
 * @returns
 */
export function NeoCustomLabel(
    props: Pick<IMenuSelectorItem<unknown>, 'label' | 'icon' | 'display' | 'title' | 'max' | 'min'> &
        INeoCustomLabelProps
): JSX.Element | null {
    const { display, value, title, icon, label, onChange, selected, onFocus, max, min } = props;
    const localeService = useDependency(LocaleService);
    const componentManager = useDependency(ComponentManager);

    function getLocale(name: string) {
        return localeService.t(name) ?? name;
    }

    if (display === DisplayTypes.COLOR) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ColorSelect value={value as any} title={getLocale(title) as string} icon={icon} />;
    }

    if (display === DisplayTypes.FONT) {
        // According to the value, translate toolbar font
        return (
            <div className={styles.fontSelect} style={{ fontFamily: value as string }}>
                {getLocale(`fontFamily.${(`${value}` || '').replace(/\s/g, '')}`)}
            </div>
        );
    }

    if (display === DisplayTypes.INPUT) {
        return (
            <Input
                onValueChange={(v) => onChange?.(v as unknown as string)}
                onFocus={onFocus}
                type="number"
                value={`${value}`}
                bordered={false}
                style={{
                    width: '32px',
                    height: '24px',
                    padding: '0',
                    textAlign: 'center',
                    background: 'transparent',
                }}
                max={max}
                min={min}
            />
        );
    }

    if (display === DisplayTypes.ICON && icon) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const IconComponent = componentManager.get(icon) as any;
        if (IconComponent) {
            return <IconComponent {...props} />;
        }
    }

    if (display === DisplayTypes.CUSTOM && label) {
        const labelName = typeof label === 'string' ? label : (label as ICustomComponent).name;
        const customProps = (label as ICustomComponent).props ?? {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const LabelComponent = componentManager.get(labelName) as any;
        if (LabelComponent) {
            return <LabelComponent {...customProps} {...props} />;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LabelComponent = icon ? (componentManager.get(icon) as any) : null;

    // Process Font Family drop-down list font
    return (
        <div
            className={styles.neoCustomLabelItem}
            style={{ fontFamily: title.indexOf('fontFamily.') === 0 ? `${value}` : 'inherit' }}
        >
            {selected && (
                <span className={styles.selectItemSelected}>
                    <CheckMarkSingle style={{ color: 'rgb(var(--success-color))' }} />
                </span>
            )}
            {LabelComponent && <LabelComponent extend={{ colorChannel1: 'rgb(var(--primary-color))' }} />}
            <span className={styles.selectItemContent}>{getLocale(title)}</span>
        </div>
    );
}

export interface IColorSelectProps {
    icon?: string;
    title: string;
    /** color */
    value: string;
}

export function ColorSelect({ value, icon, title }: IColorSelectProps) {
    const componentManager = useDependency(ComponentManager);
    const localeService = useDependency(LocaleService);

    function renderIconComponent() {
        if (icon) {
            const IconComponent = componentManager.get(icon) as any;

            if (IconComponent) {
                // TODO: @jikkai fix the colorChannel1
                // return <IconComponent extend={{ colorChannel1: value }} />;
                return <IconComponent />;
            }
        }

        return localeService.t(title) ?? title;
    }

    return <div className={styles.colorSelect}>{renderIconComponent()}</div>;
}
