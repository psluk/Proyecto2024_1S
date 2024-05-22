import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Statistics = (): React.ReactElement => {
  const [data, setData] = useState<
    | {
        title: string;
        pieData: ChartData<"pie", number[], unknown>;
      }[]
    | null
  >(null);

  const assignData = (
    dataToAssign: {
      title: string;
      values: { label: string; value: number }[];
    }[],
  ): void => {
    const newData = dataToAssign.map((item) => ({
      title: item.title,
      pieData: {
        labels: item.values.map((value) => value.label),
        datasets: [
          {
            data: item.values.map((value) => value.value),
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    }));
    setData(newData);
  };

  useEffect(() => {
    const newData = window.mainController.gatherStatistics();
    assignData(newData);
  }, []);

  return (
    <main className="gap-16 p-4">
      <h1 className="text-3xl font-bold">Estadísticas</h1>
      <div className="grid items-center justify-center gap-16 md:grid-cols-2 lg:grid-cols-3">
        {data &&
          data.map((item, index) => (
            <div
              key={index}
              className="flex h-full w-full flex-col items-center gap-2 rounded-lg bg-white p-4 shadow-md"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <Pie data={item.pieData} />
            </div>
          ))}
      </div>
    </main>
  );
};

export default Statistics;
