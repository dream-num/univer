import type { DocumentDataModel } from '@univerjs/core';
import type { EmbedFloatDomData } from '@univerjs/embed-ui';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { EmbedFloatDomRenderer } from '@univerjs/embed-ui';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';
import { SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';

export function EmbedDocsCustomBlockRenderer(props: { data?: EmbedFloatDomData }) {
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const hostUnitId = normalizeFloatDomData(props.data)?.hostUnitId;

    useEffect(() => {
        if (!hostUnitId) {
            return undefined;
        }

        const disposables: Array<() => void> = [];
        const refresh = () => {
            const documentModel = univerInstanceService.getUnit<DocumentDataModel>(hostUnitId, UniverInstanceType.UNIVER_DOC);
            const zoomRatio = documentModel?.zoomRatio;
            if (typeof zoomRatio !== 'number') {
                return;
            }

            commandService.syncExecuteCommand(SetDocZoomRatioOperation.id, { unitId: hostUnitId, zoomRatio });
        };
        const schedule = (callback: () => void) => {
            if (typeof requestAnimationFrame === 'function') {
                const frame = requestAnimationFrame(callback);
                disposables.push(() => cancelAnimationFrame(frame));
                return;
            }

            const timer = setTimeout(callback, 16);
            disposables.push(() => clearTimeout(timer));
        };
        const scheduleDelay = (delay: number) => {
            const timer = setTimeout(refresh, delay);
            disposables.push(() => clearTimeout(timer));
        };

        refresh();
        schedule(refresh);
        schedule(() => schedule(refresh));
        scheduleDelay(120);
        scheduleDelay(500);

        return () => {
            disposables.forEach((dispose) => dispose());
        };
    }, [commandService, hostUnitId, univerInstanceService]);

    return <EmbedFloatDomRenderer {...props} />;
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
