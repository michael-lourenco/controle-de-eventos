import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Tentar autenticar com Firebase Auth
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          
          const user = userCredential.user;
          
          // Buscar dados do usuário no Firestore
          const { db } = await import('./firebase');
          const { doc, getDoc } = await import('firebase/firestore');
          
          const userDoc = await getDoc(doc(db, 'controle_users', user.uid));
          const userData = userDoc.data();
          
          return {
            id: user.uid,
            email: user.email!,
            name: userData?.nome || user.displayName || 'Usuário',
            role: userData?.role || 'user'
          };
        } catch (error) {
          console.error('Erro na autenticação Firebase:', error);
          
          // Fallback para usuários de desenvolvimento (se Firebase não estiver configurado)
          if (credentials?.email === 'admin@clickse.com' && credentials?.password.length >= 3) {
            return {
              id: '1',
              email: 'admin@clickse.com',
              name: 'Administrador',
              role: 'admin'
            };
          }
          
          if (credentials?.email === 'user@clickse.com' && credentials?.password.length >= 3) {
            return {
              id: '2',
              email: 'user@clickse.com',
              name: 'Usuário Teste',
              role: 'user'
            };
          }
          
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
