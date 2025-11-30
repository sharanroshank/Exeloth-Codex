// inject-env.js
const fs = require('fs');
const path = require('path');

function injectEnvironmentVariables() {
    try {
        console.log('🔧 Injecting environment variables...');
        
        // Baca environment variables dari Netlify/System
        const firebaseApiKey = process.env.FIREBASE_API_KEY;
        // AMBIL KEY EMAILJS
        const emailJsPublicKey = process.env.EMAILJS_PUBLIC_KEY || 'PLACEHOLDER_KEY'; 
        const nodeEnv = process.env.NODE_ENV || 'development';

        console.log('Environment:', nodeEnv);
        
        // Handle firebase-config.js (Logika Lama)
        const firebaseConfigPath = path.join(__dirname, 'assets/js/firebase-config.js');
        if (fs.existsSync(firebaseConfigPath)) {
            let firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');
            if (firebaseApiKey) {
                firebaseConfig = firebaseConfig.replace(/apiKey: ".*?"/, `apiKey: "${firebaseApiKey}"`);
                console.log('✅ Firebase API key injected');
            }
            fs.writeFileSync(firebaseConfigPath, firebaseConfig);
        }

        // Handle env-config.js (Logika Baru untuk Frontend)
        // Kita tambahkan EMAILJS_PUBLIC_KEY ke dalam object window.ENV_CONFIG
        const envConfig = `
// Auto-generated configuration - Do not edit manually
// Generated at: ${new Date().toISOString()}
window.ENV_CONFIG = {
  NODE_ENV: "${nodeEnv}",
  BUILD_TIME: "${new Date().toISOString()}",
  FIREBASE_PROJECT: "exeloth-codex-885f2",
  EMAILJS_PUBLIC_KEY: "${emailJsPublicKey}" 
};
`;
        
        const envConfigPath = path.join(__dirname, 'assets/js/env-config.js');
        fs.writeFileSync(envConfigPath, envConfig);
        console.log('✅ Environment config generated with EmailJS Key');
        
        console.log('🎉 Build process completed!');
        
    } catch (error) {
        console.error('❌ Error in build process:', error);
        process.exit(1);
    }
}

injectEnvironmentVariables();