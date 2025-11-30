// inject-env.js
const fs = require('fs');
const path = require('path');

function injectEnvironmentVariables() {
    try {
        console.log('🔧 Injecting environment variables...');
        
        // 1. Baca environment variables dari System (Netlify)
        const firebaseApiKey = process.env.FIREBASE_API_KEY;
        const emailJsPublicKey = process.env.EMAILJS_PUBLIC_KEY || 'PLACEHOLDER_KEY'; 
        const nodeEnv = process.env.NODE_ENV || 'development';

        console.log('Environment:', nodeEnv);
        
        // 2. Handle firebase-config.js (Cara Lama - Optional jika masih pakai)
        const firebaseConfigPath = path.join(__dirname, 'assets/js/firebase-config.js');
        if (fs.existsSync(firebaseConfigPath)) {
            let firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');
            if (firebaseApiKey) {
                firebaseConfig = firebaseConfig.replace(/apiKey: ".*?"/, `apiKey: "${firebaseApiKey}"`);
                console.log('✅ Firebase API key injected');
            }
            fs.writeFileSync(firebaseConfigPath, firebaseConfig);
        }

        // 3. Handle env-config.js (Cara Baru & Aman)
        // Script ini akan membuat file 'assets/js/env-config.js' otomatis saat di Netlify
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
        
        // Pastikan folder assets/js ada
        const targetDir = path.join(__dirname, 'assets/js');
        if (!fs.existsSync(targetDir)){
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const envConfigPath = path.join(targetDir, 'env-config.js');
        fs.writeFileSync(envConfigPath, envConfig);
        console.log('✅ Environment config generated with EmailJS Key');
        
        console.log('🎉 Build process completed!');
        
    } catch (error) {
        console.error('❌ Error in build process:', error);
        process.exit(1); // Stop build jika error
    }
}

injectEnvironmentVariables();