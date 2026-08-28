import type { IDocumentData, IShapeProperties, IStyleBase } from '@univerjs/core';
import type { IPageElement, ISlideData } from '@univerjs/slides';
import { BooleanNumber, DocumentFlavor, PresetListType } from '@univerjs/core';
import { BasicShapes, PageElementType, PageType } from '@univerjs/slides';

import { createGeneratedSvg } from '../generated-svg';

const INLINE_DASHBOARD_IMAGE = createGeneratedSvg({
    width: 480,
    height: 280,
    content: [
        '<rect width="480" height="280" rx="28" fill="#18181b"/>',
        '<rect x="28" y="28" width="424" height="46" rx="12" fill="#27272a"/>',
        '<circle cx="55" cy="51" r="8" fill="#f97316"/>',
        '<circle cx="79" cy="51" r="8" fill="#facc15"/>',
        '<circle cx="103" cy="51" r="8" fill="#22c55e"/>',
        '<rect x="28" y="96" width="126" height="156" rx="16" fill="#312e81"/>',
        '<rect x="174" y="96" width="278" height="70" rx="16" fill="#4338ca"/>',
        '<rect x="174" y="186" width="82" height="66" rx="16" fill="#0ea5e9"/>',
        '<rect x="272" y="186" width="82" height="66" rx="16" fill="#14b8a6"/>',
        '<rect x="370" y="186" width="82" height="66" rx="16" fill="#f97316"/>',
    ],
});

const WHITE_TEXT: IStyleBase = {
    ff: 'Arial',
    cl: { rgb: '#f8fafc' },
};

function createTextDocument(id: string, text: string, width: number, height: number, style: IStyleBase): IDocumentData {
    const paragraphs: NonNullable<IDocumentData['body']>['paragraphs'] = [];
    const textRuns: NonNullable<IDocumentData['body']>['textRuns'] = [];
    let dataStream = '';

    text.split('\n').forEach((line, index) => {
        const startIndex = dataStream.length;
        dataStream += line;
        if (line.length > 0) {
            textRuns.push({ st: startIndex, ed: dataStream.length, ts: style });
        }
        paragraphs.push({ paragraphId: `${id}-paragraph-${index + 1}`, startIndex: dataStream.length });
        dataStream += '\r';
    });

    const sectionStartIndex = dataStream.length;
    dataStream += '\n';

    return {
        id: `${id}-document`,
        body: {
            dataStream,
            paragraphs,
            sectionBreaks: [{ sectionId: `${id}-section`, startIndex: sectionStartIndex }],
            textRuns,
        },
        documentStyle: {
            documentFlavor: DocumentFlavor.TRADITIONAL,
            pageSize: { height, width },
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
        },
    };
}

function createText(
    id: string,
    text: string,
    [left, top, width, height]: [number, number, number, number],
    richText: IStyleBase,
    zIndex = 3,
    transform: Partial<Pick<IPageElement, 'angle' | 'flipX' | 'flipY' | 'scaleX' | 'scaleY' | 'skewX' | 'skewY'>> = {}
): IPageElement {
    return {
        id,
        zIndex,
        left,
        top,
        width,
        height,
        title: id,
        description: text,
        type: PageElementType.TEXT,
        richText: {
            rich: createTextDocument(id, text, width, height, richText),
        },
        ...transform,
    };
}

function createShape(
    id: string,
    shapeType: BasicShapes,
    [left, top, width, height]: [number, number, number, number],
    fill: string,
    zIndex = 2,
    shapeProperties: Omit<IShapeProperties, 'shapeBackgroundFill'> = {},
    transform: Partial<Pick<IPageElement, 'angle' | 'flipX' | 'flipY' | 'scaleX' | 'scaleY' | 'skewX' | 'skewY'>> = {}
): IPageElement {
    return {
        id,
        zIndex,
        left,
        top,
        width,
        height,
        title: id,
        description: `${shapeType} shape`,
        type: PageElementType.SHAPE,
        shape: {
            shapeType,
            text: '',
            shapeProperties: {
                shapeBackgroundFill: { rgb: fill },
                ...shapeProperties,
            },
        },
        ...transform,
    };
}

const SLIDE_FIXTURE: ISlideData = {
    id: 'slide-workbench',
    title: 'Univer Slides workbench',
    pageSize: {
        width: 960,
        height: 540,
    },
    body: {
        pageOrder: ['overview', 'components', 'rich-text', 'media'],
        pages: {
            overview: {
                id: 'overview',
                pageType: PageType.SLIDE,
                zIndex: 1,
                title: 'Overview',
                description: 'Cover page with layered text, shapes and an inline image',
                pageBackgroundFill: { rgb: '#0f172a' },
                pageElements: {
                    'overview-edge': createShape(
                        'overview-edge',
                        BasicShapes.Rect,
                        [0, 0, 14, 540],
                        '#6366f1',
                        1
                    ),
                    'overview-glow': createShape(
                        'overview-glow',
                        BasicShapes.RoundRect,
                        [615, 100, 290, 330],
                        'rgba(99, 102, 241, 0.18)',
                        1,
                        { radius: 28 },
                        { angle: -5 }
                    ),
                    'overview-tag': createShape(
                        'overview-tag',
                        BasicShapes.RoundRect,
                        [72, 82, 260, 34],
                        '#312e81',
                        2,
                        {
                            radius: 17,
                            outline: {
                                outlineFill: { rgb: '#818cf8' },
                                weight: 1,
                            },
                        }
                    ),
                    'overview-tag-label': createText(
                        'overview-tag-label',
                        'DEVELOPER WORKBENCH',
                        [92, 89, 220, 22],
                        { ...WHITE_TEXT, fs: 12, bl: BooleanNumber.TRUE },
                        3
                    ),
                    'overview-title': createText(
                        'overview-title',
                        'Build slides,\ninspect behavior.',
                        [72, 154, 500, 150],
                        { ...WHITE_TEXT, fs: 42, bl: BooleanNumber.TRUE },
                        3
                    ),
                    'overview-subtitle': createText(
                        'overview-subtitle',
                        'Four compact pages exercise editing, styling, transforms, layers and local media.',
                        [76, 325, 460, 72],
                        { ...WHITE_TEXT, fs: 17, it: BooleanNumber.TRUE, cl: { rgb: '#cbd5e1' } },
                        3
                    ),
                    'overview-image': {
                        id: 'overview-image',
                        zIndex: 3,
                        left: 640,
                        top: 195,
                        width: 240,
                        height: 140,
                        angle: 3,
                        title: 'Inline dashboard illustration',
                        description: 'Deterministic SVG data URI without a network dependency',
                        type: PageElementType.IMAGE,
                        image: {
                            imageProperties: {
                                contentUrl: INLINE_DASHBOARD_IMAGE.source,
                            },
                        },
                    },
                    'overview-footer': createText(
                        'overview-footer',
                        'Univer Slides · local fixture',
                        [74, 472, 300, 24],
                        { ...WHITE_TEXT, fs: 12, cl: { rgb: '#94a3b8' } },
                        3
                    ),
                },
            },
            components: {
                id: 'components',
                pageType: PageType.SLIDE,
                zIndex: 2,
                title: 'Components',
                description: 'Shape, outline, typography and transform samples',
                pageBackgroundFill: { rgb: '#f8fafc' },
                pageElements: {
                    'components-title': createText(
                        'components-title',
                        'Shapes & typography',
                        [54, 42, 560, 54],
                        { ff: 'Arial', fs: 30, bl: BooleanNumber.TRUE, cl: { rgb: '#0f172a' } }
                    ),
                    'components-rule': createShape(
                        'components-rule',
                        BasicShapes.Rect,
                        [54, 102, 852, 5],
                        '#6366f1',
                        1
                    ),
                    'components-card-1': createShape(
                        'components-card-1',
                        BasicShapes.RoundRect,
                        [54, 148, 252, 286],
                        '#ffffff',
                        1,
                        {
                            radius: 20,
                            outline: {
                                outlineFill: { rgb: '#cbd5e1' },
                                weight: 2,
                            },
                        }
                    ),
                    'components-card-1-index': createShape(
                        'components-card-1-index',
                        BasicShapes.RoundRect,
                        [78, 174, 58, 48],
                        '#4f46e5',
                        2,
                        { radius: 14 }
                    ),
                    'components-card-1-number': createText(
                        'components-card-1-number',
                        '01',
                        [22, 184, 180, 28],
                        { ...WHITE_TEXT, fs: 20, bl: BooleanNumber.TRUE }
                    ),
                    'components-card-1-copy': createText(
                        'components-card-1-copy',
                        'Rounded rectangle\nwith a visible outline',
                        [78, 250, 200, 86],
                        { ff: 'Arial', fs: 18, bl: BooleanNumber.TRUE, cl: { rgb: '#1e293b' } }
                    ),
                    'components-card-2': createShape(
                        'components-card-2',
                        BasicShapes.Rect,
                        [354, 148, 252, 286],
                        '#ecfeff',
                        1,
                        {
                            outline: {
                                outlineFill: { rgb: '#06b6d4' },
                                weight: 2,
                            },
                        }
                    ),
                    'components-card-2-accent': createShape(
                        'components-card-2-accent',
                        BasicShapes.Rect,
                        [406, 195, 150, 92],
                        '#0891b2',
                        2,
                        {},
                        { angle: -8, skewX: 4 }
                    ),
                    'components-card-2-copy': createText(
                        'components-card-2-copy',
                        'Rotate + skew',
                        [394, 310, 180, 34],
                        {
                            ff: 'Georgia',
                            fs: 20,
                            it: BooleanNumber.TRUE,
                            ul: { s: BooleanNumber.TRUE },
                            cl: { rgb: '#155e75' },
                        }
                    ),
                    'components-card-3': createShape(
                        'components-card-3',
                        BasicShapes.RoundRect,
                        [654, 148, 252, 286],
                        '#fff7ed',
                        1,
                        {
                            radius: 40,
                            outline: {
                                outlineFill: { rgb: '#fb923c' },
                                weight: 3,
                            },
                        }
                    ),
                    'components-card-3-layer-1': createShape(
                        'components-card-3-layer-1',
                        BasicShapes.RoundRect,
                        [704, 194, 150, 112],
                        '#fdba74',
                        2,
                        { radius: 18 },
                        { angle: -7 }
                    ),
                    'components-card-3-layer-2': createShape(
                        'components-card-3-layer-2',
                        BasicShapes.RoundRect,
                        [722, 208, 150, 112],
                        'rgba(249, 115, 22, 0.78)',
                        3,
                        { radius: 18 },
                        { angle: 7 }
                    ),
                    'components-card-3-copy': createText(
                        'components-card-3-copy',
                        'z-index layers',
                        [694, 350, 176, 32],
                        {
                            ff: 'Arial',
                            fs: 19,
                            st: { s: BooleanNumber.TRUE },
                            cl: { rgb: '#9a3412' },
                        },
                        4
                    ),
                },
            },
            'rich-text': {
                id: 'rich-text',
                pageType: PageType.SLIDE,
                zIndex: 3,
                title: 'Rich text',
                description: 'Editable rich text and layered callout samples',
                pageBackgroundFill: { rgb: '#fff7ed' },
                pageElements: {
                    'rich-title': createText(
                        'rich-title',
                        'Editable rich text',
                        [56, 42, 520, 54],
                        { ff: 'Arial', fs: 30, bl: BooleanNumber.TRUE, cl: { rgb: '#7c2d12' } }
                    ),
                    'rich-panel': createShape(
                        'rich-panel',
                        BasicShapes.RoundRect,
                        [54, 126, 542, 350],
                        '#ffffff',
                        1,
                        {
                            radius: 24,
                            outline: {
                                outlineFill: { rgb: '#fed7aa' },
                                weight: 2,
                            },
                        }
                    ),
                    'rich-copy': {
                        id: 'rich-copy',
                        zIndex: 2,
                        left: 84,
                        top: 158,
                        width: 480,
                        height: 280,
                        title: 'Rich text sample',
                        description: 'Multiple runs and editable bullet paragraphs',
                        type: PageElementType.TEXT,
                        richText: {
                            rich: {
                                id: 'slide-rich-copy',
                                body: {
                                    dataStream:
                                            'Rich text block\rBold, italic, underline and color\rEditable bullet one\rEditable bullet two\r\n',
                                    textRuns: [
                                        {
                                            st: 0,
                                            ed: 14,
                                            ts: {
                                                ff: 'Arial',
                                                fs: 28,
                                                bl: BooleanNumber.TRUE,
                                                cl: { rgb: '#9a3412' },
                                            },
                                        },
                                        {
                                            st: 16,
                                            ed: 20,
                                            ts: { fs: 16, bl: BooleanNumber.TRUE },
                                        },
                                        {
                                            st: 22,
                                            ed: 27,
                                            ts: { fs: 16, it: BooleanNumber.TRUE },
                                        },
                                        {
                                            st: 30,
                                            ed: 38,
                                            ts: { fs: 16, ul: { s: BooleanNumber.TRUE } },
                                        },
                                        {
                                            st: 44,
                                            ed: 48,
                                            ts: { fs: 16, cl: { rgb: '#ea580c' } },
                                        },
                                        {
                                            st: 50,
                                            ed: 88,
                                            ts: { fs: 16, cl: { rgb: '#431407' } },
                                        },
                                    ],
                                    paragraphs: [
                                        { paragraphId: 'rich-heading', startIndex: 15 },
                                        { paragraphId: 'rich-styles', startIndex: 49 },
                                        {
                                            paragraphId: 'rich-bullet-1',
                                            startIndex: 69,
                                            bullet: {
                                                listType: PresetListType.BULLET_LIST,
                                                listId: 'slide-feature-list',
                                                nestingLevel: 0,
                                                textStyle: { fs: 16 },
                                            },
                                        },
                                        {
                                            paragraphId: 'rich-bullet-2',
                                            startIndex: 89,
                                            bullet: {
                                                listType: PresetListType.BULLET_LIST,
                                                listId: 'slide-feature-list',
                                                nestingLevel: 0,
                                                textStyle: { fs: 16 },
                                            },
                                        },
                                    ],
                                },
                                documentStyle: {
                                    pageSize: {
                                        width: undefined,
                                        height: undefined,
                                    },
                                    marginTop: 4,
                                    marginBottom: 4,
                                    marginLeft: 4,
                                    marginRight: 4,
                                },
                            },
                        },
                    },
                    'rich-callout-back': createShape(
                        'rich-callout-back',
                        BasicShapes.RoundRect,
                        [646, 160, 238, 210],
                        '#7c2d12',
                        1,
                        { radius: 26 },
                        { angle: -4 }
                    ),
                    'rich-callout-front': createShape(
                        'rich-callout-front',
                        BasicShapes.RoundRect,
                        [664, 178, 238, 210],
                        '#fb923c',
                        2,
                        { radius: 26 },
                        { angle: 4 }
                    ),
                    'rich-callout-copy': createText(
                        'rich-callout-copy',
                        'Double-click\nto edit',
                        [704, 236, 168, 88],
                        { ...WHITE_TEXT, fs: 25, bl: BooleanNumber.TRUE },
                        3,
                        { angle: 4 }
                    ),
                    'rich-note': createText(
                        'rich-note',
                        'The fixture stays small while covering run styles, lists and the Slides text editor bridge.',
                        [642, 424, 270, 56],
                        { ff: 'Arial', fs: 13, it: BooleanNumber.TRUE, cl: { rgb: '#9a3412' } }
                    ),
                },
            },
            media: {
                id: 'media',
                pageType: PageType.SLIDE,
                zIndex: 4,
                title: 'Media and layers',
                description: 'Inline image, positioning and object samples',
                pageBackgroundFill: { rgb: '#111827' },
                pageElements: {
                    'media-title': createText(
                        'media-title',
                        'Local media, no network',
                        [58, 44, 600, 52],
                        { ...WHITE_TEXT, fs: 30, bl: BooleanNumber.TRUE }
                    ),
                    'media-accent': createShape(
                        'media-accent',
                        BasicShapes.Rect,
                        [724, 40, 170, 54],
                        '#14b8a6',
                        1,
                        {},
                        { angle: 6 }
                    ),
                    'media-frame': createShape(
                        'media-frame',
                        BasicShapes.RoundRect,
                        [58, 132, 500, 310],
                        '#312e81',
                        1,
                        { radius: 28 }
                    ),
                    'media-image': {
                        id: 'media-image',
                        zIndex: 2,
                        left: 80,
                        top: 154,
                        width: 456,
                        height: 266,
                        title: 'Inline SVG dashboard',
                        description: 'Same deterministic data URI at a second size',
                        type: PageElementType.IMAGE,
                        image: {
                            imageProperties: {
                                contentUrl: INLINE_DASHBOARD_IMAGE.source,
                            },
                        },
                    },
                    'media-chip-1': createShape(
                        'media-chip-1',
                        BasicShapes.RoundRect,
                        [628, 162, 246, 62],
                        '#1e293b',
                        1,
                        { radius: 18 }
                    ),
                    'media-chip-1-copy': createText(
                        'media-chip-1-copy',
                        '✓ deterministic fixture',
                        [652, 181, 200, 28],
                        { ...WHITE_TEXT, fs: 16, cl: { rgb: '#5eead4' } }
                    ),
                    'media-chip-2': createShape(
                        'media-chip-2',
                        BasicShapes.RoundRect,
                        [628, 246, 246, 62],
                        '#1e293b',
                        1,
                        { radius: 18 }
                    ),
                    'media-chip-2-copy': createText(
                        'media-chip-2-copy',
                        '✓ selectable objects',
                        [652, 265, 200, 28],
                        { ...WHITE_TEXT, fs: 16, cl: { rgb: '#a5b4fc' } }
                    ),
                    'media-chip-3': createShape(
                        'media-chip-3',
                        BasicShapes.RoundRect,
                        [628, 330, 246, 62],
                        '#1e293b',
                        1,
                        { radius: 18 }
                    ),
                    'media-chip-3-copy': createText(
                        'media-chip-3-copy',
                        '✓ offline image data',
                        [652, 349, 200, 28],
                        { ...WHITE_TEXT, fs: 16, cl: { rgb: '#fdba74' } }
                    ),
                },
            },
        },
    },
};

export function createSlideFixture(): ISlideData {
    return structuredClone(SLIDE_FIXTURE);
}
