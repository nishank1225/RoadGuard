import { useState, useEffect, useCallback } from 'react';
import { Home, Map, Camera, History, User, Bell, ShieldCheck, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import type { Report, NotificationItem } from '@/lib/types';
import { UserHome } from '@/pages/user/UserHome';
import { UserMap } from '@/pages/user/UserMap';
import { UserHistory } from '@/pages/user/UserHistory';
import { UserProfile } from '@/pages/user/UserProfile';
import { ReportFlow } from '@/pages/user/ReportFlow';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { initials } from '@/lib/format';

import {
  IconLayoutDashboard,
  IconAlertTriangle,
  IconFileDescription,
  IconMap,
  IconUser,
} from '@tabler/icons-react';
import { FloatingDock, type FloatingDockItem } from '@/components/ui/floating-dock';

type Tab = 'home' | 'map' | 'camera' | 'history' | 'profile';

export function UserApp() {
  const { profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState<Tab>('home');
  const [reports, setReports] = useState<Report[]>([]);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  // Sync hash routing if present
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.replace('#', '');
      if (['home', 'map', 'camera', 'history', 'profile'].includes(h)) {
        setTab(h as Tab);
      }
    };
    if (window.location.hash) {
      handleHash();
    }
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const loadReports = useCallback(async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load user reports:', error);
      return;
    }

    console.log('Loaded user reports:', data);
    console.log('Current profile ID:', profile.id);

    setReports((data ?? []) as Report[]);
  }, [profile]);

  const loadNotifs = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(20);
    setNotifs((data ?? []) as NotificationItem[]);
  }, [profile]);

  useEffect(() => {
    loadReports();
    loadNotifs();
  }, [loadReports, loadNotifs]);

  useEffect(() => {
    if (!profile) return;
    const ch = supabase.channel('user-reports').on('postgres_changes',
      { event: '*', schema: 'public', table: 'reports', filter: `user_id=eq.${profile.id}` },
      () => { loadReports(); loadNotifs(); }).subscribe();
    const nch = supabase.channel('user-notifs').on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
      () => loadNotifs()).subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(nch); };
  }, [profile, loadReports, loadNotifs]);

  const unread = notifs.filter((n) => !n.read).length;

  const userNavItems: FloatingDockItem[] = [
    {
      title: 'Dashboard',
      icon: <IconLayoutDashboard className="h-full w-full" />,
      href: '#home',
      onClick: () => {
        setTab('home');
        window.location.hash = 'home';
      },
      active: tab === 'home',
    },
    {
      title: 'Report Road',
      icon: <IconAlertTriangle className="h-full w-full" />,
      href: '#camera',
      onClick: () => {
        setTab('camera');
        window.location.hash = 'camera';
      },
      active: tab === 'camera',
    },
    {
      title: 'My Reports',
      icon: <IconFileDescription className="h-full w-full" />,
      href: '#history',
      onClick: () => {
        setTab('history');
        window.location.hash = 'history';
      },
      active: tab === 'history',
    },
    {
      title: 'Map',
      icon: <IconMap className="h-full w-full" />,
      href: '#map',
      onClick: () => {
        setTab('map');
        window.location.hash = 'map';
      },
      active: tab === 'map',
    },
    {
      title: 'Profile',
      icon: <IconUser className="h-full w-full" />,
      href: '#profile',
      onClick: () => {
        setTab('profile');
        window.location.hash = 'profile';
      },
      active: tab === 'profile',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col surface">
      <Header profile={profile} theme={theme} toggleTheme={toggle} unread={unread} onBell={() => setShowNotifs(true)} onSignOut={signOut} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-28 pt-6">
        {tab === 'home' && <UserHome reports={reports} onNavigate={setTab} />}
        {tab === 'map' && <UserMap reports={reports} />}
        {tab === 'camera' && <ReportFlow onDone={() => { setTab('history'); loadReports(); }} />}
        {tab === 'history' && <UserHistory reports={reports} onChange={loadReports} />}
        {tab === 'profile' && <UserProfile />}
      </main>
      <FloatingDock items={userNavItems} />
      {showNotifs && <NotificationsPanel notifs={notifs} onClose={() => setShowNotifs(false)} onReload={loadNotifs} />}
    </div>
  );
}

export function Header({ profile, theme, toggleTheme, unread, onBell, onSignOut }: {
  profile: { full_name: string; avatar_url: string; role: string } | null;
  theme: string; toggleTheme: () => void; unread: number; onBell: () => void; onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-base">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white"><ShieldCheck size={20} /></div>
          <div>
            <div className="font-display font-bold leading-none">RoadGuard</div>
            <div className="text-[10px] text-muted capitalize">{profile?.role || 'user'} portal</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:surface-2 transition">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button onClick={onBell} className="p-2.5 rounded-xl hover:surface-2 transition relative">
            <Bell size={18} />
            {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>}
          </button>
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : initials(profile?.full_name || 'U')}
          </div>
          <button onClick={onSignOut} className="p-2.5 rounded-xl hover:surface-2 transition text-muted"><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ nav, tab, setTab }: { nav: { key: string; label: string; icon: typeof Home }[]; tab: string; setTab: (t: any) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 glass border-t border-base">
      <div className="max-w-6xl mx-auto px-2 flex items-center justify-around h-16">
        {nav.map((n) => {
          const Icon = n.icon; const active = tab === n.key;
          const isCamera = n.key === 'camera';
          if (isCamera) {
            return (
              <button key={n.key} onClick={() => setTab(n.key)} className="flex flex-col items-center -mt-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${active ? 'bg-primary-700 scale-110' : 'bg-primary-600'} text-white`}>
                  <Icon size={24} />
                </div>
                <span className="text-[10px] mt-1 font-medium">{n.label}</span>
              </button>
            );
          }
          return (
            <button key={n.key} onClick={() => setTab(n.key)} className="flex flex-col items-center gap-0.5 flex-1 py-2 transition">
              <Icon size={22} className={active ? 'text-primary-600' : 'text-muted'} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary-600' : 'text-muted'}`}>{n.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
