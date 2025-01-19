import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

type ChartDataItem = {
  name: string; // Nome do item (rótulo do gráfico)
  value: number; // Valor associado ao item (número de servidores ou percentual)
};

type ChartProps = {
  data: ChartDataItem[]; // Array de objetos com o formato definido acima
};

export const PieChart = ({ data }: ChartProps) => {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: ["#fbbf24", "#4e4e4e"],
      },
    ],
  };

  return <Pie data={chartData} />;
};

export const BarChart = ({ data }: ChartProps) => {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "Número de Servidores",
        data: data.map((item) => item.value),
        backgroundColor: "#fbbf24",
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
