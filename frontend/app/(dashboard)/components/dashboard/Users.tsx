"use client";

import axios from "axios";
import { useEffect, useState } from "react";

type User = {
  ID: number;
  first_name: string;
  last_name: string;
  email: string;
  role: {
    name: string;
  };
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users?page=${page}`,
        );

        setUsers(response.data.data);
        setLastPage(response.data.meta.last_page);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [page]);

  const next = () => {
    if (page < lastPage) {
      setPage(page + 1);
    }
  };

  const previous = () => {
    if (page > 1) {
      setPage(page - 1);
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
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.ID} className="border-t">
                <td className="p-3 text-center ">{user.ID}</td>
                <td className="p-3 text-center ">
                  {user.first_name} {user.last_name}
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 text-center ">{user.role.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between m-4">
        <button
          className="cursor-pointer hover:scale-105 h-7 dark:hover:bg-gray-600 rounded w-16 transition-all duration-200 text-xs dark:bg-gray-700 bg-gray-200"
          onClick={previous}
        >
          Previous
        </button>
        <button
          className="cursor-pointer hover:scale-105 h-7 dark:hover:bg-gray-600 rounded w-10 transition-all duration-200 text-xs dark:bg-gray-700 bg-gray-200"
          onClick={next}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Users;
