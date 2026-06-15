import type { EmbedDescriptor, EmbedLayout } from '@univerjs/embed';
import type { UniverInstanceType } from '@univerjs/core';
import { EmbedModelService } from '@univerjs/embed';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef } from 'react';
import { EmbedMountService } from '../services/embed-mount.service';

export interface EmbedFloatDomData {
    version: 1;
    embedId: string;
    hostUnitId?: string;
    hostAnchorId: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
}

export function EmbedFloatDomRenderer(props: { data?: EmbedFloatDomData }) {
    ensureEmbedFloatDomStyles();

    const containerRef = useRef<HTMLDivElement>(null);
    const embedModelService = useDependency(EmbedModelService);
    const mountService = useDependency(EmbedMountService);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return undefined;
        }

        const data = normalizeFloatDomData(props.data);
        const descriptor = data?.hostUnitId ? embedModelService.getDescriptor(data.hostUnitId, data.embedId) : undefined;
        const layout = descriptor ? resolveDescriptorLayout(descriptor) : undefined;
        if (!descriptor || !layout || !descriptor.childUnitId || descriptor.childType == null) {
            return undefined;
        }

        mountService.mountIntoHostElement(descriptor, container);

        return () => {
            mountService.unmount(descriptor.embedId);
        };
    }, [embedModelService, mountService, props.data]);

    const data = normalizeFloatDomData(props.data);

    return (
        <div
            ref={containerRef}
            className="univer-embed-float-dom"
            data-embed-float-dom="true"
            data-embed-id={data?.embedId}
            data-embed-host-anchor-id={data?.hostAnchorId}
        />
    );
}

function normalizeFloatDomData(data: unknown): EmbedFloatDomData | undefined {
    if (!data || typeof data !== 'object') {
        return undefined;
    }

    const candidate = data as Partial<EmbedFloatDomData>;
    if (candidate.version !== 1 || !candidate.embedId || !candidate.hostAnchorId) {
        return undefined;
    }

    return candidate as EmbedFloatDomData;
}

function resolveDescriptorLayout(descriptor: EmbedDescriptor): EmbedLayout | undefined {
    const floating = descriptor.sourceMeta?.floating || undefined;
    if (floating && typeof floating === 'object' && floating.layout) {
        return floating.layout;
    }

    const tab = descriptor.sourceMeta?.tab || undefined;
    return tab && typeof tab === 'object' && tab.enabled ? 'tab-peer' : undefined;
}

function ensureEmbedFloatDomStyles(): void {
    if (typeof document === 'undefined' || document.getElementById('univer-embed-float-dom-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'univer-embed-float-dom-styles';
    style.textContent = `
.univer-embed-float-dom {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: #ffffff;
}
`;
    document.head.appendChild(style);
}
