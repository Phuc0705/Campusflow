import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Props = {
  data: any;
};

export default function WellnessChart({ data }: Props) {
  const study = data?.study_hours ?? 0;
  const work = data?.work_hours ?? 0;
  const sleep = data?.sleep_hours_avg ?? 0;

  const chartData = {
    labels: ['Study', 'Work', 'Sleep (avg/night)'],
    datasets: [
      {
        label: 'Hours',
        data: [study, work, sleep],
        backgroundColor: ['#2563eb', '#10b981', '#8b5cf6'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  } as any;

  return <Bar data={chartData} options={options} />;
}
