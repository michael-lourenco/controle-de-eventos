import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminAuth: ReturnType<typeof getAuth>;
let adminDb: ReturnType<typeof getFirestore>;

// Inicializar Firebase Admin apenas se não estiver inicializado
if (getApps().length === 0) {
  try {
    // Tentar usar credenciais do service account se disponível
    if (process.env.FIREBASE_ADMIN_SDK_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString());
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    } else {
      // Fallback: usar Application Default Credentials ou variáveis de ambiente individuais
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    }
    
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
  } catch (error) {
    // Se não conseguir inicializar, as funções que usam admin falharão
  }
} else {
  adminApp = getApps()[0];
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
}

export { adminAuth, adminDb };

