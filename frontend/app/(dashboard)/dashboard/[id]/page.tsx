import { getuser } from "@/app/actions/user.action";
import EditUserForm from "../../components/FormUser";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return <div>Invalid user ID</div>;
  }

  const result = await getuser(userId);

  if (!result.success || !result.user) {
    return <div>User not found</div>;
  }

  return <EditUserForm user={result.user} userId={userId} />;
}
