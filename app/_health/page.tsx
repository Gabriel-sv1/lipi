export default function HealthPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>✅ OK</h1>
      <p>Server is running correctly</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
