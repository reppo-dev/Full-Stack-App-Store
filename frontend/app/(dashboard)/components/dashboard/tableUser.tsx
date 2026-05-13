"use client";
import { ModelUser } from "@/models/modles";
import { useState } from "react";
import { allUser, deleteUser } from "@/app/actions/user.action";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TableUserProps {
  initialUsers: ModelUser[];
  initialPage: number;
  initialLastPage: number;
}

const TableUser = ({
  initialUsers,
  initialPage,
  initialLastPage,
}: TableUserProps) => {
  const [users, setUsers] = useState<ModelUser[]>(initialUsers);
  const [page, setPage] = useState(initialPage);
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (newPage: number) => {
    try {
      const { users: newUsers, last_page } = await allUser(newPage);
      setUsers(newUsers);
      setLastPage(last_page);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (page < lastPage) {
      const newPage = page + 1;
      setPage(newPage);
      fetchUsers(newPage);
    }
  };

  const previous = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchUsers(newPage);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure?")) {
      setUsers((prev) => prev.filter((user) => user.ID !== id));
      await deleteUser(id);
    }
  };

  return (
    <div className="rounded-lg border bg-card mt-10">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Users</h2>
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 rounded-tl-lg text-sm font-semibold text-muted-foreground">
                ID
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Name
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Email
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Role
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="text-center">
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              users.map((user) => (
                <tr key={user.ID} className="border-t">
                  <td className="p-3 text-center">{user.ID}</td>
                  <td className="p-3 text-center">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 text-center">{user.role?.name ?? "-"}</td>
                  <td className="p-3 text-center space-x-4">
                    <Link href={`/dashboard/${user.ID}`}>
                      <Button>Edit User</Button>
                    </Link>
                    <Button onClick={() => handleDelete(user.ID)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between m-4">
        <button
          onClick={previous}
          disabled={page === 1 || loading}
          className="cursor-pointer hover:scale-105 h-7 dark:hover:bg-gray-600 rounded w-16 transition-all duration-200 text-xs dark:bg-gray-700 bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={next}
          disabled={page === lastPage || loading}
          className="cursor-pointer hover:scale-105 h-7 dark:hover:bg-gray-600 rounded w-10 transition-all duration-200 text-xs dark:bg-gray-700 bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableUser;
