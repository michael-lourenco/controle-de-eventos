import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserData {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'user';
  dataCadastro: Date;
  dataAtualizacao: Date;
}

export const authService = {
  // Registrar novo usuário
  async register(email: string, password: string, nome: string, role: 'admin' | 'user' = 'user') {
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Criar documento do usuário no Firestore
      const userData: UserData = {
        id: user.uid,
        nome,
        email,
        role,
        dataCadastro: new Date(),
        dataAtualizacao: new Date()
      };

      await setDoc(doc(db, 'controle_users', user.uid), userData);

      return { success: true, user: userData };
    } catch (error: any) {
      console.error('Erro ao registrar usuário:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao registrar usuário' 
      };
    }
  },

  // Fazer login
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Buscar dados do usuário no Firestore
      const userDoc = await getDoc(doc(db, 'controle_users', user.uid));
      const userData = userDoc.data() as UserData;

      return { success: true, user: userData };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer login' 
      };
    }
  },

  // Fazer logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer logout' 
      };
    }
  },

  // Buscar dados do usuário atual
  async getCurrentUser() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'controle_users', user.uid));
      return userDoc.data() as UserData;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }
  },

  // Atualizar dados do usuário
  async updateUser(userId: string, data: Partial<UserData>) {
    try {
      const userData = {
        ...data,
        dataAtualizacao: new Date()
      };

      await setDoc(doc(db, 'controle_users', userId), userData, { merge: true });
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao atualizar usuário' 
      };
    }
  }
};
