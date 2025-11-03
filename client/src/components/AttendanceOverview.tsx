import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Attendance {
  event_id: number;
  title: string;
  total_invited: number;
  accepted: number;
  declined: number;
  attendance_rate: number;
}

export function AttendanceOverview() {
  const [overview, setOverview] = useState<Attendance[]>([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch("http://localhost:5000/events/attendance", {
          headers: { Authorization: token || "" },
        });
        const data = await response.json();
        setOverview(data);
      } catch (err) {
        console.error("Failed to fetch attendance overview:", err);
      }
    };
    fetchOverview();
  }, [token]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg w-full">
      <div className="flex items-center gap-2 !m-1">
      <h2 className="text-2xl font-bold text-indigo-900 mb-4">
        Attendance Overview
      </h2>
      <Link
        to="/"
        className="!p-1 bg-blue-300 rounded-full hover:bg-blue-400"
        >Go Back</Link>
      </div>

      {overview.length === 0 ? (
        <p>You don't have events where you are organizer.</p>
      ) : (
        <>
          <table className="w-full text-left mb-6">
            <thead>
              <tr className="border-b">
                <th className="p-2">Event</th>
                <th className="p-2">Invited</th>
                <th className="p-2">Accepted</th>
                <th className="p-2">Declined</th>
                <th className="p-2">Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {overview.map((o) => (
                <tr key={o.event_id} className="border-b">
                  <td className="p-2">{o.title}</td>
                  <td className="p-2">{o.total_invited}</td>
                  <td className="p-2">{o.accepted}</td>
                  <td className="p-2">{o.declined}</td>
                  <td className="p-2 font-semibold text-indigo-700">
                    {o.attendance_rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overview}
                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="title"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="attendance_rate"
                  fill="#4f46e5"
                  name="Attendance %"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
