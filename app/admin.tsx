import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/constants/design';
import { BackendUser, getBackendUsers, updateBackendUserRole } from '@/data/backend';
import { families, newsFeed } from '@/data/mock';
import { safeBack } from '@/data/navigation';
import { getSession } from '@/data/session';

type ModuleKey = 'families' | 'banking' | 'content' | 'reports' | 'roles';

type AdminRow = {
  id: string;
  title: string;
  meta: string;
  value: string;
  action: string;
  done: boolean;
};

const modules: {
  key: ModuleKey;
  label: string;
  caption: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'families', label: 'Family Review', caption: 'Approve household records', icon: 'people' },
  { key: 'banking', label: 'Payment Check', caption: 'Verify account details', icon: 'card' },
  { key: 'content', label: 'Publishing', caption: 'Release news and episodes', icon: 'newspaper' },
  { key: 'reports', label: 'Reports', caption: 'Prepare export files', icon: 'analytics' },
  { key: 'roles', label: 'Access', caption: 'Control admin roles', icon: 'lock-closed' },
];

const reports = [
  { id: 'monthly', title: 'Monthly Support Summary', meta: 'Families, account records, support notes', value: 'CSV' },
  { id: 'verification', title: 'Verification Log', meta: 'Profile updates and reviewer notes', value: 'PDF' },
  { id: 'content', title: 'Publishing Activity', meta: 'Released episodes and news updates', value: 'XLSX' },
];

function toggleItem(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export default function AdminScreen() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [activeModule, setActiveModule] = useState<ModuleKey>('families');
  const [approvedFamilies, setApprovedFamilies] = useState<string[]>([]);
  const [verifiedAccounts, setVerifiedAccounts] = useState<string[]>([]);
  const [publishedItems, setPublishedItems] = useState<string[]>([]);
  const [exportedReports, setExportedReports] = useState<string[]>([]);
  const [adminUsers, setAdminUsers] = useState<BackendUser[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('Ready');

  const activeCount = families.filter((family) => family.status === 'ACTIVE').length;
  const active = modules.find((module) => module.key === activeModule) ?? modules[0];

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const session = await getSession();
      const allowed = session.user?.role === 'ADMIN';

      if (!mounted) {
        return;
      }

      setIsAuthorized(allowed);
      setToken(session.token);
      setCheckingAccess(false);

      if (!allowed) {
        router.replace('/login');
        return;
      }

      if (session.token) {
        try {
          setAdminUsers(await getBackendUsers(session.token));
        } catch {
          setStatusNote('Could not load users');
        }
      }
    }

    void checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  const rows: AdminRow[] = useMemo(() => {
    if (activeModule === 'families') {
      return families.map((family) => {
        const done = approvedFamilies.includes(family.id);
        return {
          id: family.id,
          title: family.name,
          meta: `${family.location} - Episode ${family.episodeNo}`,
          value: done ? 'Approved' : family.status,
          action: done ? 'Undo' : 'Approve',
          done,
        };
      });
    }

    if (activeModule === 'banking') {
      return families.map((family) => {
        const done = verifiedAccounts.includes(family.id);
        return {
          id: family.id,
          title: family.beneficiary,
          meta: `${family.bank} - ${family.accountNumber}`,
          value: done ? 'Verified' : family.bank,
          action: done ? 'Recheck' : 'Verify',
          done,
        };
      });
    }

    if (activeModule === 'content') {
      return newsFeed.map((item) => {
        const done = publishedItems.includes(item.id);
        return {
          id: item.id,
          title: item.title,
          meta: `${item.category} - ${item.readTime}`,
          value: done ? 'Published' : item.isNew ? 'Draft' : 'Queued',
          action: done ? 'Unpublish' : 'Publish',
          done,
        };
      });
    }

    if (activeModule === 'reports') {
      return reports.map((report) => {
        const done = exportedReports.includes(report.id);
        return {
          ...report,
          value: done ? 'Exported' : report.value,
          action: done ? 'Refresh' : 'Export',
          done,
        };
      });
    }

    return adminUsers.map((user) => {
      const done = user.role === 'ADMIN';
      return {
        id: user.id,
        title: user.full_name || user.email,
        meta: user.email,
        value: user.role,
        action: done ? 'Set USER' : 'Set ADMIN',
        done,
      };
    });
  }, [activeModule, approvedFamilies, verifiedAccounts, publishedItems, exportedReports, adminUsers]);

  const handleRowAction = async (row: AdminRow) => {
    if (activeModule === 'families') {
      setApprovedFamilies((current) => toggleItem(current, row.id));
      setStatusNote(row.done ? `${row.title} returned to review` : `${row.title} approved`);
      return;
    }

    if (activeModule === 'banking') {
      setVerifiedAccounts((current) => toggleItem(current, row.id));
      setStatusNote(row.done ? `${row.title} marked for recheck` : `${row.title} verified`);
      return;
    }

    if (activeModule === 'content') {
      setPublishedItems((current) => toggleItem(current, row.id));
      setStatusNote(row.done ? `${row.title} unpublished` : `${row.title} published`);
      return;
    }

    if (activeModule === 'reports') {
      setExportedReports((current) => (current.includes(row.id) ? current : [...current, row.id]));
      setStatusNote(`${row.title} export prepared`);
      return;
    }

    if (!token) {
      setStatusNote('No admin session');
      return;
    }

    const nextRole = row.done ? 'USER' : 'ADMIN';
    const previousUsers = adminUsers;
    setAdminUsers((current) => current.map((user) => (
      user.id === row.id ? { ...user, role: nextRole } : user
    )));
    setStatusNote(`${row.title} set to ${nextRole}`);

    try {
      const updatedUser = await updateBackendUserRole(token, row.id, nextRole);
      setAdminUsers((current) => current.map((user) => (
        user.id === updatedUser.id ? updatedUser : user
      )));
    } catch {
      setAdminUsers(previousUsers);
      setStatusNote('Could not update role');
    }
  };

  if (checkingAccess || !isAuthorized) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#FAF7F2]" edges={['top', 'bottom']}>
        <Text className="font-beSemiBold text-sm text-[#756B63]">Checking admin access...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View className="mt-3 flex-row items-center justify-between">
            <Pressable onPress={() => safeBack('/(tabs)')} className="h-11 w-11 items-center justify-center rounded-full bg-white" style={styles.circle}>
              <Ionicons name="arrow-back" size={20} color={palette.text} />
            </Pressable>
            <View className="items-center">
              <Text className="font-beBold text-[25px] text-[#261F1A]">Admin</Text>
              <Text className="mt-0.5 font-beMedium text-[11px] uppercase text-[#B7842D]">Operations</Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white" style={styles.circle}>
              <Ionicons name="shield-checkmark" size={20} color={palette.primary} />
            </View>
          </View>

          <View className="mt-5 rounded-[28px] border border-[#E8D6C9] bg-[#FFF7F1] p-5" style={styles.hero}>
            <View className="flex-row items-start">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EAE1]">
                <Ionicons name="grid" size={22} color={palette.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-beBold text-[27px] leading-[34px] text-[#261F1A]">Control Center</Text>
                <Text className="mt-2 font-beRegular text-sm leading-6 text-[#6E635B]">
                  Review family records, verify payment data, publish content, and manage access.
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5 flex-row">
            <View className="mr-3 flex-1 rounded-[22px] bg-white p-4" style={styles.metric}>
              <Text className="font-beBold text-2xl text-primary">{families.length}</Text>
              <Text className="mt-1 font-beMedium text-xs text-[#756B63]">families</Text>
            </View>
            <View className="mr-3 flex-1 rounded-[22px] bg-white p-4" style={styles.metric}>
              <Text className="font-beBold text-2xl text-primary">{activeCount}</Text>
              <Text className="mt-1 font-beMedium text-xs text-[#756B63]">active</Text>
            </View>
            <View className="flex-1 rounded-[22px] bg-white p-4" style={styles.metric}>
              <Text className="font-beBold text-2xl text-primary">{publishedItems.length}</Text>
              <Text className="mt-1 font-beMedium text-xs text-[#756B63]">published</Text>
            </View>
          </View>

          <View className="mt-5 rounded-[26px] bg-white p-4" style={styles.panel}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-beBold text-lg text-[#261F1A]">Workspace</Text>
              <Text className="max-w-[46%] text-right font-beSemiBold text-xs text-[#B7842D]" numberOfLines={2}>
                {statusNote}
              </Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moduleStrip}>
              {modules.map((module) => {
                const isActive = module.key === activeModule;

                return (
                  <Pressable
                    key={module.key}
                    onPress={() => {
                      setActiveModule(module.key);
                      setStatusNote(`${module.label} opened`);
                    }}
                    className={`mr-3 rounded-[20px] px-4 py-3 ${isActive ? 'bg-primary' : 'bg-[#F7F2EC]'}`}
                    style={styles.moduleChip}
                  >
                    <Ionicons name={module.icon} size={18} color={isActive ? '#fff' : palette.primary} />
                    <Text className={`mt-2 font-beBold text-sm ${isActive ? 'text-white' : 'text-[#261F1A]'}`}>{module.label}</Text>
                    <Text className={`mt-1 font-beRegular text-[11px] leading-4 ${isActive ? 'text-white/78' : 'text-[#756B63]'}`} numberOfLines={2}>
                      {module.caption}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View className="mt-5 rounded-[26px] bg-white p-4" style={styles.panel}>
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-[#F3EAE1]">
                <Ionicons name={active.icon} size={19} color={palette.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-beBold text-lg text-[#261F1A]">{active.label}</Text>
                <Text className="font-beRegular text-xs text-[#756B63]">{active.caption}</Text>
              </View>
            </View>

            {rows.map((row, index) => (
              <Pressable
                key={row.id}
                onPress={() => setStatusNote(`${row.title} selected`)}
                className="rounded-[20px] bg-[#FAF7F2] p-3"
                style={index !== rows.length - 1 ? styles.rowSpacing : undefined}
              >
                <View className="flex-row items-center">
                  <View className={`mr-3 h-10 w-10 items-center justify-center rounded-2xl ${row.done ? 'bg-[#E9F8EE]' : 'bg-white'}`}>
                    <Ionicons name={row.done ? 'checkmark' : 'ellipse-outline'} size={18} color={row.done ? palette.success : palette.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-beSemiBold text-sm leading-5 text-[#261F1A]" numberOfLines={1}>
                      {row.title}
                    </Text>
                    <Text className="mt-1 font-beRegular text-xs leading-5 text-[#756B63]" numberOfLines={1}>
                      {row.meta}
                    </Text>
                  </View>
                  <Text className={`ml-2 font-beBold text-xs ${row.done ? 'text-[#1F8B4C]' : 'text-primary'}`}>{row.value}</Text>
                </View>
                <Pressable onPress={() => void handleRowAction(row)} className={`mt-3 self-start rounded-full px-3 py-2 ${row.done ? 'bg-white' : 'bg-primary'}`}>
                  <Text className={`font-beSemiBold text-xs ${row.done ? 'text-primary' : 'text-white'}`}>{row.action}</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  circle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  hero: {
    shadowColor: '#8B1D1D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 3,
  },
  metric: {
    minHeight: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  moduleChip: {
    minHeight: 112,
    width: 150,
  },
  moduleStrip: {
    paddingRight: 4,
  },
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
  panel: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  rowSpacing: {
    marginBottom: 10,
  },
});
