// app/dashboard/users/page.tsx (یا هر مسیری که Users در آن قرار دارد)
import { allUser } from "@/app/actions/user.action";
import TableUser from "./tableUser";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const page = 1;

  const { users, last_page } = await allUser(page);

  return (
    <TableUser
      initialUsers={users}
      initialPage={page}
      initialLastPage={last_page}
    />
  );
}
