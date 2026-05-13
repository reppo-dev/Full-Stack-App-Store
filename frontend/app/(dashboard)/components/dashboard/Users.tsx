import { allUser } from "@/app/actions/user.action";
import TableUser from "./tableUser";

export default async function UsersPage() {
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
