export interface IGeneratedSvg {
    height: number;
    source: string;
    width: number;
}

interface ICreateGeneratedSvgOptions {
    content: readonly string[];
    height: number;
    width: number;
}

export function createGeneratedSvg({ content, height, width }: ICreateGeneratedSvgOptions): IGeneratedSvg {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        throw new RangeError('Generated SVG dimensions must be finite positive numbers.');
    }

    const markup = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
        ...content,
        '</svg>',
    ].join('');

    return {
        height,
        source: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`,
        width,
    };
}

export function readGeneratedSvgSize(source: string): Pick<IGeneratedSvg, 'height' | 'width'> {
    const separatorIndex = source.indexOf(',');
    if (!source.startsWith('data:image/svg+xml') || separatorIndex < 0) {
        throw new TypeError('Expected an SVG data URI.');
    }

    const markup = decodeURIComponent(source.slice(separatorIndex + 1));
    const viewBox = /<svg\b[^>]*\bviewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(markup);
    if (!viewBox) {
        throw new TypeError('Generated SVG must use a zero-origin numeric viewBox.');
    }

    return {
        height: Number(viewBox[2]),
        width: Number(viewBox[1]),
    };
}
