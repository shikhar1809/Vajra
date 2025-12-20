"use client";

import { useState, useEffect } from "react";
import { MapPin, AlertTriangle, CheckCircle, Users, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Employee {
    id: string;
    name: string;
    properties: {
        last_location?: {
            city: string;
            country: string;
            lat: number;
            lon: number;
            timezone: string;
        };
        within_geofence?: boolean;
        ip_address?: string;
        timestamp?: string;
    };
    risk_score: number;
}

export default function GeolocationTracker() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [trackingEmployee, setTrackingEmployee] = useState("");
    const [result, setResult] = useState<any>(null);

    const loadEmployees = async () => {
        try {
            const response = await fetch('/api/sentry/geolocation');
            const data = await response.json();

            if (data.success) {
                setEmployees(data.data.employees);
            }
        } catch (error) {
            console.error('Failed to load employees:', error);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const trackLocation = async () => {
        if (!trackingEmployee) return;

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/sentry/geolocation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: trackingEmployee,
                    ip: '127.0.0.1',
                    userAgent: navigator.userAgent,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data);
                loadEmployees(); // Refresh list
            }
        } catch (error) {
            console.error('Location tracking failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tracking Interface */}
            <Card className="cyber-card border-blue-500/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <MapPin className="w-6 h-6 text-blue-500" />
                        Employee Geolocation Tracking
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Track Employee */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={trackingEmployee}
                            onChange={(e) => setTrackingEmployee(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && trackLocation()}
                            placeholder="Enter employee ID or email..."
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={trackLocation}
                            disabled={loading || !trackingEmployee}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
                        >
                            <Globe className="w-5 h-5" />
                            {loading ? 'Tracking...' : 'Track Location'}
                        </button>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className={`p-4 rounded-lg border ${result.isWithinGeofence
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                            }`}>
                            <div className="flex items-start gap-3">
                                {result.isWithinGeofence ? (
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className={`font-semibold mb-2 ${result.isWithinGeofence ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {result.isWithinGeofence
                                            ? '✓ Within Authorized Area'
                                            : '⚠ Outside Geofence'}
                                    </p>
                                    <div className="space-y-1 text-sm text-gray-300">
                                        <p><strong>Location:</strong> {result.location.city}, {result.location.country}</p>
                                        <p><strong>Coordinates:</strong> {result.location.lat.toFixed(4)}, {result.location.lon.toFixed(4)}</p>
                                        <p><strong>Timezone:</strong> {result.location.timezone}</p>
                                    </div>
                                    {result.alert && (
                                        <p className="mt-2 text-xs text-red-400">
                                            🚨 Security alert has been created
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info */}
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-400 text-sm">
                            Track employee locations in real-time. Alerts are automatically created when employees access the system from outside authorized areas.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Employee List */}
            <Card className="cyber-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Users className="w-5 h-5" />
                        Recent Employee Locations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {employees.length > 0 ? (
                        <div className="space-y-3">
                            {employees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="p-4 bg-white/5 border border-white/10 rounded-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-white font-semibold">{employee.name}</p>
                                            {employee.properties.last_location && (
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {employee.properties.last_location.city}, {employee.properties.last_location.country}
                                                </p>
                                            )}
                                            {employee.properties.timestamp && (
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {new Date(employee.properties.timestamp).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <Badge className={
                                            employee.properties.within_geofence
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                                        }>
                                            {employee.properties.within_geofence ? 'Inside' : 'Outside'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">
                            No employee locations tracked yet. Track an employee to get started.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
