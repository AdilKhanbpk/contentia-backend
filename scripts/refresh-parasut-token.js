import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CLIENT_ID = process.env.PARASUT_CLIENT_ID;
const CLIENT_SECRET = process.env.PARASUT_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.PARASUT_REFRESH_TOKEN;

async function refreshParasutToken() { 
    console.log('🔄 Refreshing Paraşüt access token...');
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('❌ Missing CLIENT_ID or CLIENT_SECRET in .env file');
        process.exit(1);
    }

    if (!REFRESH_TOKEN) {
        console.error('❌ Missing REFRESH_TOKEN in .env file');
        console.log('Please run the full OAuth setup: npm run setup:parasut YOUR_AUTH_CODE');
        process.exit(1);
    }

    try {
        const response = await axios.post('https://api.parasut.com/oauth/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: 'refresh_token'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;
        
        console.log('✅ Token refreshed successfully!');
        console.log(`New Access Token: ${access_token.substring(0, 20)}...`);
        console.log(`Expires in: ${expires_in} seconds`);

        // Update .env file
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const envPath = path.join(__dirname, '..', '.env');s
        
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Update tokens
        envContent = envContent.replace(/PARASUT_ACCESS_TOKEN=.*/, `PARASUT_ACCESS_TOKEN=${access_token}`);
        if (refresh_token) {
            envContent = envContent.replace(/PARASUT_REFRESH_TOKEN=.*/, `PARASUT_REFRESH_TOKEN=${refresh_token}`);
        }
        
        const expiryTimestamp = Date.now() + (expires_in * 1000);
        envContent = envContent.replace(/PARASUT_TOKEN_EXPIRY=.*/, `PARASUT_TOKEN_EXPIRY=${expiryTimestamp}`);
        
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ .env file updated with new tokens!');
        
    } catch (error) {
        console.error('❌ Failed to refresh token:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        
        console.log('💡 You may need to complete the full OAuth flow again:');
        console.log('npm run setup:parasut YOUR_NEW_AUTH_CODE');
    }
}

refreshParasutToken();
