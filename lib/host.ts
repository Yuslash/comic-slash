const isProduction = process.env.NODE_ENV === 'production';

// Robust Logic:
// In Production: Use empty string to use Next.js Rewrites (Same Origin Proxy) -> Fixes Cookie Issues
// In Development: Use localhost
let apiHost = process.env.NEXT_PUBLIC_API_URL || (isProduction ? '' : 'http://localhost:5000');

// Clean it (trim spaces, remove quotes)
if (apiHost) {
    apiHost = apiHost.trim().replace(/^["']|["']$/g, '');

    // Ensure no trailing slash
    if (apiHost.endsWith('/')) {
        apiHost = apiHost.slice(0, -1);
    }

    // Ensure Protocol is present (only if not empty)
    if (apiHost && !apiHost.startsWith('http://') && !apiHost.startsWith('https://')) {
        // If it's localhost, assume http, otherwise https
        const protocol = apiHost.includes('localhost') ? 'http' : 'https';
        apiHost = `${protocol}://${apiHost}`;
    }
}

const server = {
    host: apiHost, // Can be empty string (relative)
    port: ''
};

export const getBaseUrl = () => {
    return server.host;
};

export default server;