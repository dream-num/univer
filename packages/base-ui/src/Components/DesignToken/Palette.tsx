import { defaultTheme as theme } from '../../Basics/CSS';

const levelMap = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950', '1000'];

function generateColors(name: string, maxLevel: number) {
    const colors = [];
    for (let i = 0; i < maxLevel; i++) {
        const key = `${name}${levelMap[i]}`;

        colors.push({
            bg: theme[key],
            name: key,
            less: `@${name}-${levelMap[i]}`,
        });
    }

    return colors;
}

const palettes = [
    {
        title: 'Ramu / 瑞木 / Red',
        colors: generateColors('red', 9),
    },
    {
        title: 'Hemerocallis / 萱草 / Orange',
        colors: generateColors('orange', 9),
    },
    {
        title: 'Marigold / 万寿菊 / Gold',
        colors: generateColors('gold', 9),
    },
    {
        title: 'Forsythia Suspensa / 连翘 / Yellow',
        colors: generateColors('yellow', 9),
    },
    {
        title: 'Eustoma Grandiflorum / 洋桔梗 / Verdancy',
        colors: generateColors('verdancy', 9),
    },
    {
        title: 'Asparagus Fern / 文竹 / Green',
        colors: generateColors('green', 9),
    },
    {
        title: '霁 / Jiqing',
        colors: generateColors('jiqing', 9),
    },
    {
        title: 'Cornflower / 矢车菊 / Blue',
        colors: generateColors('blue', 9),
    },
    {
        title: 'Hyacinth / 风信子 / Hyacinth Blue',
        colors: generateColors('hyacinth', 9),
    },
    {
        title: 'Violet / 紫罗兰 / Purple',
        colors: generateColors('purple', 9),
    },
    {
        title: 'Sorrel pulp / 酢浆 / Magenta',
        colors: generateColors('magenta', 9),
    },
    {
        title: '灰 / Grey',
        colors: generateColors('grey', 12),
    },
    {
        title: '黑 / 白 / Black / White',
        colors: [
            {
                bg: theme.colorBlack,
                name: 'colorBlack',
                less: '@color-black',
            },
            {
                bg: theme.colorWhite,
                name: 'colorWhite',
                less: '@color-white',
            },
        ],
    },
    {
        title: 'Fuctional / 功能',
        colors: [
            {
                bg: theme.colorInfo,
                name: 'colorInfo',
                less: '@color-info',
            },
            {
                bg: theme.colorSuccess,
                name: 'colorSuccess',
                less: '@color-success',
            },
            {
                bg: theme.colorWarning,
                name: 'colorWarning',
                less: '@color-warning',
            },
            {
                bg: theme.colorError,
                name: 'colorError',
                less: '@color-error',
            },
        ],
    },
];

export function Palette() {
    return (
        <section>
            {palettes.map((palette) => (
                <section key={palette.title}>
                    <h2>{palette.title}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>name</th>
                                <th>value</th>
                                <th>Less variable</th>
                            </tr>
                        </thead>

                        <tbody>
                            {palette.colors.map((color) => (
                                <tr key={color.name}>
                                    <td>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '13px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'inline-block',
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: color.bg,
                                                }}
                                            />
                                            {color.name}
                                        </div>
                                    </td>
                                    <td>
                                        <pre style={{ fontSize: '13px' }}>{color.bg}</pre>
                                    </td>
                                    <td>{color.less}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ))}
        </section>
    );
}
