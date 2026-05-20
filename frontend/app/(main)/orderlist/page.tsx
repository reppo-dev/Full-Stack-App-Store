"use client";

import { orderUser } from "@/app/actions/order";
import axios from "axios";
import React, { useEffect, useState } from "react";

type OrderItem = {
  ID: number;
  order_id: number;
  product_title: string;
  price: number;
  quantity: number;
};

type Order = {
  ID: number;
  name: string;
  email: string;
  total: number;
  order_items: OrderItem[];
};

const Order = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await orderUser();
        console.log(response);
        console.log(response.data);
        if (response.success) {
          setOrders(response.data);
        } else {
          console.log(response.message);
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const [selected, setSelected] = useState(0);

  const select = (id: number) => {
    setSelected(selected !== id ? id : 0);
  };

  return (
    <div className="container mx-auto pb-10">
      <div className="mx-4 overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full border-collapse text-center rounded-lg overflow-hidden">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 font-semibold">#</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Total</th>
              <th className="px-6 py-3 font-semibold"></th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order: Order) => (
              <React.Fragment key={order.ID}>
                <tr className="border-t">
                  <td className="px-6 py-4 font-medium">{order.ID}</td>
                  <td className="px-6 py-4">{order.name}</td>
                  <td className="px-6 py-4">{order.email}</td>
                  <td className="px-6 py-4 font-bold">${order.total}</td>
                  <td>
                    <button
                      onClick={() => select(order.ID)}
                      className="w-12 h-8 cursor-pointer bg-gray-200 rounded hover:bg-gray-300 hover:scale-105 transition-all duration-150 text-black"
                    >
                      View
                    </button>
                  </td>
                </tr>
                {selected === order.ID && (
                  <tr className="dark:bg-gray-400 bg-gray-50">
                    <td colSpan={5} className="p-0 border-b">
                      <div className="overflow-hidden py-4 px-6 ml-8 mr-4 my-2 dark:bg-gray-950 bg-white rounded-lg border-l-4 border-blue-400 shadow-sm">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">
                          Order Items
                        </h4>
                        <table className="w-full text-left text-sm">
                          <thead className="text-xs text-gray-500 dark:bg-gray-700/50 rounded-lg bg-gray-50/50 border-b">
                            <tr>
                              <th className="py-2 px-4 font-medium">#</th>
                              <th className="py-2 px-4 font-medium">
                                Product Title
                              </th>
                              <th className="py-2 px-4 font-medium">
                                Quantity
                              </th>
                              <th className="py-2 px-4 font-medium">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.order_items.map((e: OrderItem) => {
                              return (
                                <tr
                                  key={e.ID}
                                  className="border-b last:border-0 hover:bg-gray-50/50"
                                >
                                  <td className="py-2 px-4 text-gray-600">
                                    {e.ID}
                                  </td>
                                  <td className="py-2 px-4 font-medium text-gray-800">
                                    {e.product_title}
                                  </td>
                                  <td className="py-2 px-4 text-gray-600">
                                    {e.quantity}
                                  </td>
                                  <td className="py-2 px-4 text-gray-600">
                                    ${e.price}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Order;
