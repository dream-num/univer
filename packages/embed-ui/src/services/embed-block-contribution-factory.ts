import type { UniverInstanceType } from '@univerjs/core';
import type { IRibbonService } from '@univerjs/ui';
import type { EmbedBlockContribution } from '../types/embed-ui';
import { DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY, DEFAULT_EMBED_FLOAT_LAYOUT_POLICY, DEFAULT_EMBED_TAB_LAYOUT_POLICY } from '@univerjs/embed';
import { of } from 'rxjs';
import { createEmbedProductMenuInjector } from './embed-product-menu-mounting';
import { EmbedProductMenuRegistryService } from './embed-product-menu-registry.service';

export interface CreateEmbedRibbonBlockContributionOptions {
    childType: UniverInstanceType;
    productName: string;
    menuSchema?: unknown;
}

export interface CreateEmbedNoHeaderBlockContributionOptions {
    childType: UniverInstanceType;
    productName: string;
    hostHeaderMode?: 'none' | 'placeholder';
}

export function createEmbedRibbonBlockContribution(options: CreateEmbedRibbonBlockContributionOptions): EmbedBlockContribution {
    const { childType, productName } = options;

    return {
        childType,
        productName,
        layoutPolicy: {
            tab: DEFAULT_EMBED_TAB_LAYOUT_POLICY,
            float: DEFAULT_EMBED_FLOAT_LAYOUT_POLICY,
            docFlow: DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY,
        },
        createRibbonOverride: ({ childUnitId, injector }) => {
            const menuSchema = getEmbedProductMenuSchema(injector, childType) ?? options.menuSchema;
            if (!menuSchema) {
                return undefined;
            }

            const scoped = createEmbedProductMenuInjector(injector as never, {
                childType,
                childUnitId,
                menuSchema,
                menuTitlePrefix: productName,
            });

            return {
                ribbonService: scoped.ribbonService,
                placeholderTitle: productName,
                disposable: scoped.disposable,
            };
        },
    };
}

function getEmbedProductMenuSchema(injector: unknown, childType: UniverInstanceType): unknown | undefined {
    const maybeInjector = injector as { has?: (dependency: unknown) => boolean; get?: <T>(dependency: unknown) => T };
    if (!maybeInjector.has?.(EmbedProductMenuRegistryService) || !maybeInjector.get) {
        return undefined;
    }

    return maybeInjector.get<EmbedProductMenuRegistryService>(EmbedProductMenuRegistryService).getMergedMenuSchema(childType);
}

export function createEmbedNoHeaderBlockContribution(options: CreateEmbedNoHeaderBlockContributionOptions): EmbedBlockContribution {
    return {
        childType: options.childType,
        productName: options.productName,
        hostHeaderMode: options.hostHeaderMode ?? 'none',
        layoutPolicy: {
            tab: {
                ...DEFAULT_EMBED_TAB_LAYOUT_POLICY,
                ribbon: 'hidden',
            },
            float: DEFAULT_EMBED_FLOAT_LAYOUT_POLICY,
            docFlow: DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY,
        },
        createRibbonOverride: options.hostHeaderMode === 'placeholder'
            ? () => ({
                ribbonService: createEmptyRibbonService(),
                placeholderTitle: options.productName,
            })
            : undefined,
    };
}

function createEmptyRibbonService(): IRibbonService {
    return {
        ribbon$: of([]),
        activatedTab$: of(''),
        collapsedIds$: of([]),
        fakeToolbarVisible$: of(false),
        setActivatedTab: () => {},
        showContextualTab: () => {},
        hideContextualTab: () => {},
        hideAllContextualTabs: () => {},
        setCollapsedIds: () => {},
        setFakeToolbarVisible: () => {},
    };
}
