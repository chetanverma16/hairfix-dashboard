"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { clusters, monthlyRamp, scenarios } from "@/data/insights"

const tipStyle = { borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }

export function ScenarioChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={scenarios} barGap={4}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} unit="L" width={40} />
        <Tooltip contentStyle={tipStyle} formatter={(v) => [`₹${v}L`]} />
        <Bar dataKey="revenue" name="Revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="profit" name="Profit" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RampChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={monthlyRamp}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} unit="L" width={40} />
        <Tooltip contentStyle={tipStyle} formatter={(v) => [`₹${v}L / month`]} />
        <Line type="monotone" dataKey="revenue" name="Monthly revenue" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ClusterChart() {
  const data = [...clusters].sort((a, b) => b.reviews - a.reviews)
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis type="category" dataKey="cluster" width={190} tickLine={false} axisLine={false} fontSize={11} />
        <Tooltip contentStyle={tipStyle} formatter={(v, _n, p) => [`${v} reviews · ${p.payload.studios} studios`]} />
        <Bar dataKey="reviews" radius={[0, 4, 4, 0]}>
          {data.map((d) => (
            <Cell key={d.cluster} fill={d.verdict.includes("First") ? "var(--chart-2)" : d.verdict.includes("Second") ? "var(--chart-4)" : "var(--chart-3)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
