import { PageElementType } from '@univerjs/slides';
import { describe, expect, it } from 'vitest';

import { readGeneratedSvgSize } from '../../generated-svg';
import { createSlideFixture } from '../create-slide-fixture';

function getElementBounds(element: { height?: number; left?: number; top?: number; width?: number }) {
    if (element.height == null || element.left == null || element.top == null || element.width == null) {
        throw new Error('Fixture element must define complete bounds.');
    }

    return {
        bottom: element.top + element.height,
        left: element.left,
        right: element.left + element.width,
        top: element.top,
    };
}

function intersects(
    first: ReturnType<typeof getElementBounds>,
    second: ReturnType<typeof getElementBounds>
): boolean {
    return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

describe('createSlideFixture', () => {
    it('creates fresh offline pages spanning text, shapes and images', () => {
        const first = createSlideFixture();
        const second = createSlideFixture();
        if (!first.body || !second.body) {
            throw new Error('Slides workbench fixtures must include a body.');
        }

        const elements = Object.values(first.body.pages).flatMap(({ pageElements }) => Object.values(pageElements));
        const elementTypes = new Set(elements.map(({ type }) => type));
        const images = elements.filter(({ type }) => type === PageElementType.IMAGE);
        const textBoxes = elements.filter(({ type }) => type === PageElementType.TEXT);
        const generatedTextBoxes = textBoxes.filter(({ id }) => id !== 'rich-copy');

        expect(elementTypes).toEqual(new Set([PageElementType.IMAGE, PageElementType.SHAPE, PageElementType.TEXT]));
        expect(images.every(({ image }) => image?.imageProperties?.contentUrl?.startsWith('data:image/svg+xml'))).toBe(true);
        images.forEach(({ height, image, width }) => {
            const source = image?.imageProperties?.contentUrl;
            if (!source || width == null || height == null) {
                throw new Error('Generated slide images must include a source and render dimensions.');
            }

            const intrinsicSize = readGeneratedSvgSize(source);
            expect(width / height).toBeCloseTo(intrinsicSize.width / intrinsicSize.height, 8);
        });
        expect(generatedTextBoxes.every(({ richText }) => {
            const style = richText?.rich?.documentStyle;
            return style?.marginBottom === 0 && style.marginLeft === 0 && style.marginRight === 0 && style.marginTop === 0;
        })).toBe(true);
        expect(textBoxes.every(({ width }) => width != null && width > 144)).toBe(true);
        expect(first.body.pages).not.toBe(second.body.pages);
        expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    });

    it('keeps generated images centered in their frames without colliding with foreground elements', () => {
        const fixture = createSlideFixture();
        const overview = fixture.body?.pages.overview.pageElements;
        const media = fixture.body?.pages.media.pageElements;
        if (!overview || !media) {
            throw new Error('Slides workbench must include overview and media pages.');
        }

        const overviewFrame = getElementBounds(overview['overview-glow']);
        const overviewImage = getElementBounds(overview['overview-image']);
        expect((overviewImage.left + overviewImage.right) / 2).toBe((overviewFrame.left + overviewFrame.right) / 2);
        expect((overviewImage.top + overviewImage.bottom) / 2).toBe((overviewFrame.top + overviewFrame.bottom) / 2);

        const mediaFrame = getElementBounds(media['media-frame']);
        const mediaImage = getElementBounds(media['media-image']);
        expect([
            mediaImage.left - mediaFrame.left,
            mediaImage.top - mediaFrame.top,
            mediaFrame.right - mediaImage.right,
            mediaFrame.bottom - mediaImage.bottom,
        ]).toEqual([22, 22, 22, 22]);

        const collidingForegroundElements = Object.values(media)
            .filter(({ id, zIndex }) => id !== 'media-image' && id !== 'media-frame' && zIndex > 1)
            .filter((element) => intersects(mediaImage, getElementBounds(element)));
        expect(collidingForegroundElements).toEqual([]);
    });
});
