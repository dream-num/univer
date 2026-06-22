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
