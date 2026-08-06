import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { Logo } from "@/components/marketing/logo";

export default async function OnboardingPage() {
  const { profile } = await requireUser();
  if (profile.onboarding_completed) redirect("/home");

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="flex h-16 items-center px-6"><Logo /></div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <OnboardingFlow initialStep={profile.onboarding_step} displayName={profile.display_name} />
      </div>
    </div>
  );
}
