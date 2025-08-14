export default function SimpleAdmin() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Admin Test</h1>
      <div className="bg-green-100 p-4 rounded">
        <p>Admin Dashboard ist erfolgreich geladen!</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  );
}