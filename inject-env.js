// netlify/inject-env.js
const fs = require('fs');
const path = require('path');

function injectEnvironmentVariables() {
    try {
        console.log('🔧 Injecting environment variables...');
        
        // Baca environment variables dari Netlify
        const firebaseApiKey = process.env.FIREBASE_API_KEY;
        const nodeEnv = process.env.NODE_ENV || 'development';

        console.log('Environment:', nodeEnv);
        console.log('Firebase API Key:', firebaseApiKey ? '***' + firebaseApiKey.slice(-4) : 'Not set');

        // Handle firebase-config.js
        const firebaseConfigPath = path.join(__dirname, '../assets/js/firebase-config.js');
        
        if (fs.existsSync(firebaseConfigPath)) {
            let firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');
            
            if (firebaseApiKey) {
                // Ganti API key dengan environment variable
                firebaseConfig = firebaseConfig.replace(
                    /apiKey: ".*?"/,
                    `apiKey: "${firebaseApiKey}"`
                );
                console.log('✅ Firebase API key injected');
            } else {
                console.log('⚠️  FIREBASE_API_KEY not set, using default');
            }
            
            fs.writeFileSync(firebaseConfigPath, firebaseConfig);
        } else {
            console.log('❌ firebase-config.js not found');
        }

        // Create environment config file untuk frontend
        const envConfig = `
// Auto-generated configuration - Do not edit manually
// Generated at: ${new Date().toISOString()}
window.ENV_CONFIG = {
  NODE_ENV: "${nodeEnv}",
  BUILD_TIME: "${new Date().toISOString()}",
  FIREBASE_PROJECT: "exeloth-codex-885f2"
  // Note: Sensitive API keys are server-side only
};
`;
        
        const envConfigPath = path.join(__dirname, '../assets/js/env-config.js');
        fs.writeFileSync(envConfigPath, envConfig);
        console.log('✅ Environment config generated');
        
        console.log('🎉 Build process completed!');
        
    } catch (error) {
        console.error('❌ Error in build process:', error);
        process.exit(1);
    }
}

injectEnvironmentVariables();