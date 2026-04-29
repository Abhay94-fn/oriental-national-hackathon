import { Sidebar } from '../../components/layout/Sidebar';
import { TopBar } from '../../components/layout/TopBar';
import { OnboardingModal } from '../../components/layout/OnboardingModal';
import { VoiceNavigator } from '../../components/layout/VoiceNavigator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          {children}
        </main>
      </div>
      <VoiceNavigator />
      <OnboardingModal />
    </div>
  );
}
