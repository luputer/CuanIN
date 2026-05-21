"use client";

import React from "react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";

type StatCardProps = {
	title: string;
	value: string;
	icon: React.ReactNode;
	iconColor?: string;
	bgColor?: string;
	showArrow?: boolean;
	change?: number | null;
};

export const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	icon,
	iconColor,
	bgColor,
	showArrow,
	change,
}) => {
	const isPositive = (change ?? 0) >= 0;

	return (
		<div className={`${bgColor ?? "bg-white"} gap-1 rounded-xl border border-slate-800 shadow-[0px_1px_0px_rgba(29,41,61)] p-4 flex flex-col transition-transform hover:scale-101`}>
			<div className="flex justify-between items-start mb-3">
				<div className={`rounded-full text-2xl ${iconColor}`}>
					{icon}
				</div>
				{showArrow && (
					<div className="flex items-center justify-center p-1.5 rounded-full bg-cyan-600 text-white cursor-pointer">
						<ArrowUpRightIcon size={14} weight="bold" />
					</div>
				)}
			</div>

			<div className="flex flex-col gap-1">
				<p className="text-xs font-semibold text-slate-800">
					{title}
				</p>
				<h2 className="text-lg font-semibold text-cyan-600">
					{value}
				</h2>
			</div>

			<div className="mt-1 flex items-center justify-between font-regular text-xs text-slate-600">
				<span>30 hari terakhir</span>
				{change != null && (
					<span className={`px-2 py-1 rounded-full text-xs font-regular ${isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
						{isPositive ? "+" : ""}{change.toFixed(1)}%
					</span>
				)}
			</div>
		</div>
	);
};
