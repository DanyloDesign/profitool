import { notFound } from "next/navigation";
import { isLocale } from "@/i18n";
import { ProfileView } from "@/components/account/profile-view";

/**
 * Демо-кабінет (016): без сесії ProfileView сама зробить router.replace на форму входу —
 * серверних searchParams і redirects() тут немає, це має лишатись статичним експортом.
 */
export default async function AccountProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="shell pb-8 pt-10">
      <ProfileView />
    </div>
  );
}
