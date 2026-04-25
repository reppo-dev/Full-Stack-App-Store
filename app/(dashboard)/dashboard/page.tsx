import React from "react";
import Calculate from "../components/dashboard/Calculate";
import Details from "../components/dashboard/Details";
import { ChartAreaInteractive } from "../components/dashboard/Chart";

const Dashboard = () => {
  return (
    <div className="mx-2 md:mx-8">
      <h1 className="text-3xl flex flex-col mx-2 md:mx-8 my-2 md:my-8">
        Dashboard
      </h1>
      <Calculate />
      <ChartAreaInteractive />
      <Details />
    </div>
  );
};

export default Dashboard;
