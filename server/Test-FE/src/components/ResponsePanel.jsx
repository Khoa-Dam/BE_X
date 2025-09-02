export default function ResponsePanel({ response }) {
    if (!response) return null;
    return (
        <div className={`response ${response.isError ? 'error' : 'success'}`}>
            <div className={`status ${response.isError ? 'error' : 'success'}`}>
                {response.isError ? '❌ Error' : '✅ Success'}
            </div>
            <div><strong>Timestamp:</strong> {response.timestamp}</div>
            <pre>{JSON.stringify(response.data, null, 2)}</pre>
        </div>
    );
}
