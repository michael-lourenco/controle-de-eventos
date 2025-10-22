'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import ThemeToggle from '@/components/ThemeToggle';
import {
  HomeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Eventos', href: '/eventos', icon: CalendarIcon },
  { name: 'Pagamentos', href: '/pagamentos', icon: CurrencyDollarIcon },
  { name: 'Relatórios', href: '/relatorios', icon: ChartBarIcon },
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon },
];

const adminNavigation = [
  { name: 'Collections', href: '/admin/collections', icon: CogIcon },
  { name: 'Usuários', href: '/admin/users', icon: UserIcon },
  { name: 'Migração', href: '/admin/migration', icon: CogIcon },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const loading = status === 'loading';
  const user = session?.user ? {
    name: session.user.name || 'Usuário',
    email: session.user.email || ''
  } : null;

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-64 flex-col bg-surface shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-primary">Click-se</h1>
            <button
              type="button"
              className="text-text-muted hover:text-text-secondary cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-text-secondary hover:bg-surface hover:text-text-primary"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            {/* Seção de Administração - Mobile */}
            {/* {user && (
              <>
                <div className="border-t border-border my-4"></div>
                <div className="px-2">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Administração
                  </h3>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </>
            )} */}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-surface border-r border-border">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-primary">Click-se</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-text-secondary hover:bg-surface hover:text-text-primary"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            {/* Seção de Administração */}
            {/* {user && (
              <>
                <div className="border-t border-border my-4"></div>
                <div className="px-2">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Administração
                  </h3>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-text-secondary hover:bg-surface hover:text-text-primary"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </>
            )} */}
          </nav>
          <div className="flex-shrink-0 border-t border-border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 rounded-full bg-surface" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={handleLogout}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-text-primary lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />
              <ThemeToggle />
              <div className="flex items-center gap-x-2">
                <UserIcon className="h-6 w-6 text-text-muted" />
                <span className="text-sm font-medium text-text-primary">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
