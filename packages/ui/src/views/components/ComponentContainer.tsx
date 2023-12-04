import type { ComponentType } from 'react';
import React from 'react';

export function ComponentContainer(props: { components?: Set<() => ComponentType> }) {
    const { components } = props;

    if (!components) return null;

    return Array.from(components.values()).map((component, index) =>
        React.createElement(component(), { key: `${index}` })
    );
}
