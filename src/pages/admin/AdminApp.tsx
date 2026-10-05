import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, FileText, Users, Map as MapIcon, BarChart3, Bell, ShieldCheck, Moon, Sun, LogOut, Activity, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import type { Report, Profile, NotificationItem } from '@/lib/types';
import { Header } from '@/pages/user/UserApp';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminReports } from '@/pages/admin/AdminReports';
import { AdminComplaints } from '@/pages/admin/AdminComplaints';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminMap } from '@/pages/admin/AdminMap';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { initials } from '@/lib/format';

import {
  IconLayoutDashboard,
  IconClipboardList,
  IconMessageReport,
  IconUsers,
  IconMap,
  IconChartBar,
} from '@tabler/icons-react';
import { FloatingDock, type FloatingDockItem } from '@/components/ui/floating-dock';

type Tab = 'dashboard' | 'reports' | 'complaints' | 'users' | 'map' | 'analytics';

export function AdminApp() {
  const { profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  // Sync hash routing if present
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.replace('#', '');
      if (['dashboard', 'reports', 'complaints', 'users', 'map', 'analytics'].includes(h)) {
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
    const { data } = await supabase.from('reports').select('*, reporter:profiles!reports_user_id_fkey(id,full_name,email,avatar_url)').order('created_at', { ascending: false });
    setReports((data ?? []) as unknown as Report[]);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data ?? []) as Profile[]);
  }, []);

  const loadNotifs = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(20);
    setNotifs((data ?? []) as NotificationItem[]);
  }, [profile]);

  useEffect(() => {
    loadReports(); loadUsers(); loadNotifs();
  }, [loadReports, loadUsers, loadNotifs]);

  useEffect(() => {
    const ch = supabase.channel('admin-reports').on('postgres_changes',
      { event: '*', schema: 'public', table: 'reports' },
      () => { loadReports(); }).subscribe();
    const uch = supabase.channel('admin-users').on('postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      () => loadUsers()).subscribe();
    const nch = supabase.channel('admin-notifs').on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile?.id}` },
      () => loadNotifs()).subscribe();
    return () => { supabase.removeChannel(ch); supabase.removeChannel(uch); supabase.removeChannel(nch); };
  }, [loadReports, loadUsers, loadNotifs, profile]);

  const unread = notifs.filter((n) => !n.read).length;

  const adminNavItems: FloatingDockItem[] = [
    {
      title: 'Dashboard',
      icon: <IconLayoutDashboard className="h-full w-full" />,
      href: '#dashboard',
      onClick: () => {
        setTab('dashboard');
        window.location.hash = 'dashboard';
      },
      active: tab === 'dashboard',
    },
    {
      title: 'Reports',
      icon: <IconClipboardList className="h-full w-full" />,
      href: '#reports',
      onClick: () => {
        setTab('reports');
        window.location.hash = 'reports';
      },
      active: tab === 'reports',
    },
    {
      title: 'Complaints',
      icon: <IconMessageReport className="h-full w-full" />,
      href: '#complaints',
      onClick: () => {
        setTab('complaints');
        window.location.hash = 'complaints';
      },
      active: tab === 'complaints',
    },
    {
      title: 'Users',
      icon: <IconUsers className="h-full w-full" />,
      href: '#users',
      onClick: () => {
        setTab('users');
        window.location.hash = 'users';
      },
      active: tab === 'users',
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
      title: 'Analytics',
      icon: <IconChartBar className="h-full w-full" />,
      href: '#analytics',
      onClick: () => {
        setTab('analytics');
        window.location.hash = 'analytics';
      },
      active: tab === 'analytics',
    },
  ];

  return (
    <div className="min-h-screen flex surface">

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header profile={profile} theme={theme} toggleTheme={toggle} unread={unread} onBell={() => setShowNotifs(true)} onSignOut={signOut} />
        <main className="flex-1 p-4 md:p-6 pb-28 md:pb-28 max-w-7xl mx-auto w-full">
          {tab === 'dashboard' && <AdminDashboard reports={reports} users={users} onNavigate={(t) => { setTab(t); window.location.hash = t; }} />}
          {tab === 'reports' && <AdminReports reports={reports} onChange={loadReports} />}
          {tab === 'complaints' && <AdminComplaints />}
          {tab === 'users' && <AdminUsers users={users} onChange={loadUsers} />}
          {tab === 'map' && <AdminMap reports={reports} />}
          {tab === 'analytics' && <AdminAnalytics reports={reports} users={users} />}
        </main>
        {/* Floating Dock navigation */}
        <FloatingDock items={adminNavItems} />
      </div>
      {showNotifs && <NotificationsPanel notifs={notifs} onClose={() => setShowNotifs(false)} onReload={loadNotifs} />}
    </div>
  );
}
