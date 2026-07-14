export const CustomRangeLoading = () => {
    const divStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        boxSizing: 'border-box' as const,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center' as const,
        transformOrigin: 'top left',
    };

    return (
        <div style={divStyle}>
            Custom Loading...
        </div>
    );
};

export const FloatDomContentBoxProbe = ({ data }: { data?: { border?: boolean } }) => (
    <div
        data-float-dom-content-box-probe=""
        style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            border: data?.border ? '1px solid #f00' : 'none',
            background: 'rgba(255, 255, 255, 0.25)',
        }}
    />
);
