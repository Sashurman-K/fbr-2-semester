export default function About() {
    const pageStyle = {
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: '#edf2f7',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        maxWidth: '600px',
        margin: '40px auto'
    };

    const titleStyle = {
        color: '#2b6cb0',
        fontSize: '2.5rem',
        marginBottom: '20px',
        fontFamily: 'system-ui, sans-serif'
    };

    const badgeStyle = {
        display: 'inline-block',
        padding: '6px 12px',
        backgroundColor: '#3182ce',
        color: '#fff',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        marginBottom: '15px',
        textTransform: 'uppercase'
    };

    const textStyle = {
        color: '#4a5568',
        fontSize: '1.1rem',
        lineHeight: '1.6'
    };

    return (
        <div style={pageStyle}>
            <span style={badgeStyle}>Оптимизация</span>
            <h1 style={titleStyle}>О нас</h1>
            <p style={textStyle}>
                Эта страница была загружена асинхронно по требованию (Lazy Loading).
                Браузер скачал её отдельным чанком только в момент клика по ссылке!
            </p>
        </div>
    );
}