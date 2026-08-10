import type { Metadata } from "next";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl">
          Profile
        </h1>
        <p className="mt-2 text-sm text-muted">
          Keep your account details up to date.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
