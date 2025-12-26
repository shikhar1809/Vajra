"use client";

import { useEffect, useState } from "react";
import { AreaChart } from "@tremor/react";
import { Users, AlertTriangle, CheckCircle, TrendingDown, BookOpen, MoreHorizontal, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import clsx from "clsx";

interface Employee {
    id: string;
    email: string;
    name: string;
    department: string;
    risk_score: number;
    training_status: string;
    last_phishing_test_result: string;
    failed_login_count_24h: number;
}

interface EmployeeSummary {
    avg_risk_score: number;
    overdue_training_count: number;
    phishing_fail_count: number;
    high_risk_user_count: number;
}

export default function EmployeeSecurityPage() {
    const [summary, setSummary] = useState<EmployeeSummary | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const summaryRes = await fetch("http://localhost:8000/api/v1/employees/summary");
                const listRes = await fetch("http://localhost:8000/api/v1/employees/list");

                if (summaryRes.ok) setSummary(await summaryRes.json());
                if (listRes.ok) setEmployees(await listRes.json());
            } catch (e) {
                console.error("Failed to fetch employee data", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const assignTraining = async (id: string) => {
        try {
            await fetch(`http://localhost:8000/api/v1/employees/${id}/assign-training`, { method: "POST" });
            alert(`Remedial training assigned to employee ${id}`);
            // Optimistic update
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, training_status: "Remedial-Required" } : e));
        } catch (e) { console.error(e); alert("Failed to assign training"); }
    };

    const mockChartData = [
        { date: 'Jan', clickRate: 12 },
        { date: 'Feb', clickRate: 10 },
        { date: 'Mar', clickRate: 8 },
        { date: 'Apr', clickRate: 5 },
        { date: 'May', clickRate: 4 },
        { date: 'Jun', clickRate: 3 },
    ];

    if (isLoading) return <div className="p-8 text-white">Loading Human Risk Monitor...</div>;

    return (
        <div className="p-8 h-full overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Human Risk Monitor</h1>
                    <p className="text-slate-400 text-sm mt-1">Focus on the 5% of users who cause 90% of breaches.</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Phishing Susceptibility</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{summary?.phishing_fail_count} Users</div>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                            <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
                            Failed last simulation
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Training Adherence</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {employees.length > 0 ? Math.round(((employees.length - (summary?.overdue_training_count || 0)) / employees.length) * 100) : 0}%
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {summary?.overdue_training_count} users overdue
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Critical Human Risks</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{summary?.high_risk_user_count}</div>
                        <p className="text-xs text-red-400/80 mt-1 font-medium">Requires immediate attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="col-span-2 bg-slate-900 border-slate-800">
                    <CardHeader><CardTitle className="text-slate-200">Phishing Click Rate Trend (6 Months)</CardTitle></CardHeader>
                    <CardContent>
                        <AreaChart
                            className="h-64"
                            data={mockChartData}
                            index="date"
                            categories={["clickRate"]}
                            colors={["orange"]}
                            valueFormatter={(number) => `${number}%`}
                            showAnimation={true}
                        />
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 flex flex-col justify-center gap-4 p-6">
                    <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 justify-start">
                        <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" /> Launch Phishing Sim
                    </Button>
                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 justify-start">
                        <BookOpen className="mr-2 h-4 w-4 text-blue-500" /> Send Training Reminders
                    </Button>
                </Card>
            </div>

            {/* Table */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-slate-200">High Risk & At-Risk Users</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800 hover:bg-slate-900">
                                <TableHead className="text-slate-400">User</TableHead>
                                <TableHead className="text-slate-400">Department</TableHead>
                                <TableHead className="text-slate-400">Risk Score</TableHead>
                                <TableHead className="text-slate-400">Training Status</TableHead>
                                <TableHead className="text-slate-400">Last Phishing</TableHead>
                                <TableHead className="text-slate-400">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((employee) => (
                                <TableRow key={employee.id} className="border-slate-800 hover:bg-slate-800/50">
                                    <TableCell className="font-medium text-slate-200">
                                        <div>{employee.name}</div>
                                        <div className="text-xs text-slate-500">{employee.email}</div>
                                    </TableCell>
                                    <TableCell className="text-slate-400">{employee.department}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={clsx(
                                            employee.risk_score > 75 ? "border-red-900 bg-red-950 text-red-400" :
                                                employee.risk_score > 50 ? "border-yellow-900 bg-yellow-950 text-yellow-400" :
                                                    "border-green-900 bg-green-950 text-green-400"
                                        )}>
                                            {employee.risk_score}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className={clsx(
                                            "text-sm font-medium",
                                            employee.training_status === "Up-to-Date" ? "text-green-500" : "text-yellow-500"
                                        )}>
                                            {employee.training_status}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={clsx(
                                            "text-xs px-2 py-1 rounded",
                                            employee.last_phishing_test_result === 'Passed' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        )}>{employee.last_phishing_test_result}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => assignTraining(employee.id)}>
                                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
