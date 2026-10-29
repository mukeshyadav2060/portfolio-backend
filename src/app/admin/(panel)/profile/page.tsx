import { ResourceForm } from "@/components/admin/resource-form";
import { profileFields } from "@/lib/resources/fields";
import { getProfile } from "@/lib/queries";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const profile = await getProfile().catch(() => ({}));
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted">Identity, hero copy, contact details and site-wide settings.</p>
      <ResourceForm fields={profileFields} initial={profile} endpoint="/api/v1/admin/profile" method="PUT" />
    </>
  );
}
