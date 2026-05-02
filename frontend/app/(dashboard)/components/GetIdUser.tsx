"use server";

import axios from "axios";
import { cookies } from "next/headers";

const GetIdUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  const res = await axios.get(`http://localhost:3000/api/user`, {
    headers: {
      Cookie: `jwt=${token}`,
    },
  });
  const data = res.data;

  return data;
};

export default GetIdUser;
