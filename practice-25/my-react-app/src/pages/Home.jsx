export default function Home() {
  const pageStyle = {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    maxWidth: '600px',
    margin: '40px auto'
  };

  const titleStyle = {
    color: '#2c3e50',
    fontSize: '2.5rem',
    marginBottom: '20px',
    fontFamily: 'system-ui, sans-serif'
  };

  const textStyle = {
    color: '#7f8c8d',
    fontSize: '1.2rem',
    lineHeight: '1.6'
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Главная страница</h1>
      <p style={textStyle}>
        Добро пожаловать в наше современное React-приложение, собранное с помощью сверхбыстрого сборщика Vite!
      </p>
    </div>
  );
}