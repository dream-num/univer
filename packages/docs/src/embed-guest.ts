import type { ICreateUnitOptions, IDocumentData, Injector } from '@univerjs/core';
import type { EmbedCapability } from '@univerjs/embed';
import { DocumentDataModel, DocumentFlavor, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { registerEmbedCapabilities, registerEmbedGuestContribution } from '@univerjs/embed';

const DOCS_HOST_EMBED_CAPABILITIES: readonly EmbedCapability[] = [
    {
        hostType: UniverInstanceType.UNIVER_DOC,
        childType: UniverInstanceType.UNIVER_SHEET,
        entry: 'docs-custom-block',
        mode: 'float',
        layout: 'docs-sticky-sheet',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_DOC,
        childType: UniverInstanceType.UNIVER_BASE,
        entry: 'docs-custom-block',
        mode: 'float',
        layout: 'docs-sticky-base',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_DOC,
        childType: UniverInstanceType.UNIVER_SLIDE,
        entry: 'docs-custom-block',
        mode: 'float',
        layout: 'aspect-fit',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
];

export function registerDocsEmbedHostCapabilities(injector: Injector): void {
    registerEmbedCapabilities(injector, DOCS_HOST_EMBED_CAPABILITIES);
}

export function registerDocsEmbedGuestContribution(injector: Injector): void {
    if (!injector.has(IUniverInstanceService)) {
        return;
    }

    const univerInstanceService = injector.get(IUniverInstanceService);
    registerEmbedGuestContribution(injector, {
        childType: UniverInstanceType.UNIVER_DOC,
        createEmptyUnit: (config, options) => createDocsEmbedEmptyUnit(univerInstanceService, config, options),
    });
}

export function createDocsEmbedEmptySnapshot(config: Record<string, unknown> = {}): IDocumentData {
    const empty = new DocumentDataModel({}).getSnapshot();
    return {
        ...empty,
        ...config,
        id: typeof config.id === 'string' ? config.id : empty.id,
        title: typeof config.title === 'string' ? config.title : empty.title,
        documentStyle: {
            ...empty.documentStyle,
            ...(typeof config.documentStyle === 'object' && config.documentStyle ? config.documentStyle : {}),
            documentFlavor: DocumentFlavor.MODERN,
        },
    } as IDocumentData;
}

function createDocsEmbedEmptyUnit(
    univerInstanceService: IUniverInstanceService,
    config: Record<string, unknown> | undefined,
    options: ICreateUnitOptions | undefined
) {
    const unit = univerInstanceService.createUnit<IDocumentData, DocumentDataModel>(
        UniverInstanceType.UNIVER_DOC,
        createDocsEmbedEmptySnapshot(config),
        options
    );

    return {
        unitId: unit.getUnitId(),
        unitType: UniverInstanceType.UNIVER_DOC,
    };
}
