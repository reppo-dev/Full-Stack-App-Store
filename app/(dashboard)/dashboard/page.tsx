import Calculate from "../components/dashboard/Calculate";
import Details from "../components/dashboard/Details";
import { ChartAreaInteractive } from "../components/dashboard/Chart";
import { ChartBarInteractive } from "../components/dashboard/chart-bar-interactive";
import { ChartLineMultiple } from "../components/dashboard/chart-line-multiple";
import { ChartPieDonutText } from "../components/dashboard/chart-pie-donut-text";
import { ChartBarLabelCustom } from "../components/dashboard/chart-bar-label-custom";

const Dashboard = () => {
  return (
    <div className="mx-2 md:mx-8">
      <h1 className="text-3xl flex flex-col mx-2 md:mx-8 my-2 md:my-8">
        Dashboard
      </h1>
      <Calculate />
      <ChartAreaInteractive />
      <Details />
      <ChartBarInteractive />
      <div className="grid grid-cols-2 gap-4 md:flex justify-around mt-10">
        <ChartPieDonutText />
        <ChartBarLabelCustom />
        <ChartLineMultiple />
      </div>
    </div>
  );
};

export default Dashboard;
