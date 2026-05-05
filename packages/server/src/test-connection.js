async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/health');
    console.log('Health status:', res.status);
    console.log('Body:', await res.json());
  } catch (err) {
    console.error('Failed to connect to backend:', err.message);
  }
}
test();
