# San Diego Saints Choir Music Library System Scanner

This is the barcode scanner for checking items in and out of the San Diego Saints Choir Music Library.

## Development Setup

### HTTPS Configuration

This project uses HTTPS in development mode to enable secure features like camera access for barcode scanning.

#### Prerequisites

Install mkcert (if not already installed):

```bash
# macOS
brew install mkcert

# Install the local certificate authority
mkcert -install
```

#### Generate Certificates

1. Create the certs directory and generate certificates:

```bash
cd /path/to/multi-scanner
mkdir certs
cd certs
mkcert parkernilson-macbook.local localhost
```

This will create:
- `parkernilson-macbook.local+1-key.pem` (private key)
- `parkernilson-macbook.local+1.pem` (certificate)

#### Running the Dev Server

```bash
npm run dev
```

The server will start with HTTPS enabled:
- **Local access:** `https://localhost:5173`
- **Network access:** `https://parkernilson-macbook.local:5173`

#### Testing on Mobile Devices

To test on a mobile device connected to the same network:

1. Access the app at: `https://parkernilson-macbook.local:5173`

2. **(Optional)** To avoid certificate warnings on mobile devices, install the mkcert CA:
   - Find the CA location: `mkcert -CAROOT`
   - Share `rootCA.pem` to your mobile device (via AirDrop or email)
   - **iOS:** Settings → General → VPN & Device Management → Install Profile, then Settings → General → About → Certificate Trust Settings → Enable full trust
   - **Android:** Settings → Security → Install from storage

#### Notes

- Certificates are gitignored and must be generated locally
- HTTPS is only enabled in development mode (`NODE_ENV=development`)
- If you switch networks, you may need to access via IP address or regenerate certificates
