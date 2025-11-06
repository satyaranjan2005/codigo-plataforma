"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, FileText, TrendingUp, Activity } from "lucide-react";
import SuperAdminGuard from "@/components/SuperAdminGuard";
import api from "@/lib/api";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalEvents: 0,
    totalTeams: 0,
    registrations: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);
  const [webVitals, setWebVitals] = useState({
    CLS: null,
    INP: null,
    FCP: null,
    LCP: null,
    TTFB: null,
  });
  const [backendPerformance, setBackendPerformance] = useState(null);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Error loading user:", e);
    }

    // Load stats from localStorage (you can replace with API calls)
    try {
      const registrations = localStorage.getItem("registrations");
      if (registrations) {
        const parsed = JSON.parse(registrations);
        setStats(prev => ({ ...prev, registrations: Array.isArray(parsed) ? parsed.length : 0 }));
      }
    } catch (e) {
      console.error("Error loading stats:", e);
    }

    // Fetch recent activities from API
    fetchActivities();

    // Fetch backend performance metrics
    fetchBackendPerformance();

    // Load Web Vitals
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS((metric) => reportWebVitals(metric));
        onINP((metric) => reportWebVitals(metric));
        onFCP((metric) => reportWebVitals(metric));
        onLCP((metric) => reportWebVitals(metric));
        onTTFB((metric) => reportWebVitals(metric));
      });
    }
  }, []);

  const reportWebVitals = (metric) => {
    console.log(metric);
    setWebVitals(prev => ({
      ...prev,
      [metric.name]: {
        value: metric.value,
        rating: metric.rating,
      }
    }));
  };

  const fetchBackendPerformance = async () => {
    try {
      setBackendLoading(true);
      setBackendError(null);
      const response = await api.get("/admin/performance");
      const data = response?.data || response;
      setBackendPerformance(data);
    } catch (error) {
      console.error("Error fetching backend performance:", error);
      setBackendError("Failed to load backend performance metrics");
    } finally {
      setBackendLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      const response = await api.get("/admin/activities");
      const data = response?.data || response;
      
      // Handle different response formats
      const activities = Array.isArray(data) ? data : (data?.activities || []);
      setRecentActivity(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivitiesError("Failed to load activities");
      // Keep default activities as fallback
      setRecentActivity([
        { id: 1, action: "New team registered", time: "2 hours ago", user: "Team Alpha" },
        { id: 2, action: "Event created", time: "5 hours ago", user: "Admin" },
        { id: 3, action: "Member joined", time: "1 day ago", user: "John Doe" },
        { id: 4, action: "Case study submitted", time: "2 days ago", user: "Team Beta" },
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Active Events",
      value: stats.totalEvents || 1,
      icon: Calendar,
      color: "bg-green-500",
      change: "+5%",
    },
    {
      title: "Registered Teams",
      value: stats.registrations,
      icon: FileText,
      color: "bg-purple-500",
      change: "+8%",
    },
    {
      title: "Case Studies",
      value: stats.totalTeams,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "+15%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Welcome back, {user?.name || "Admin"}! Here's what's happening with your events.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
          
          {activitiesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-slate-600">Loading activities...</p>
            </div>
          ) : activitiesError ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">{activitiesError}</p>
              <button 
                onClick={fetchActivities}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600">No recent activities</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-600 mt-1">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all activity →
              </button>
            </>
          )}
        </Card>
      </div>

      {/* Web Vitals Performance Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900">Web Performance Metrics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* CLS - Cumulative Layout Shift */}
          <div className="border rounded-lg p-4">
            <div className="text-xs text-slate-500 font-medium mb-1">CLS</div>
            <div className="text-2xl font-bold text-slate-900">
              {webVitals.CLS ? webVitals.CLS.value.toFixed(3) : '-'}
            </div>
            <div className={`text-xs mt-1 font-medium ${
              !webVitals.CLS ? 'text-slate-400' :
              webVitals.CLS.rating === 'good' ? 'text-green-600' :
              webVitals.CLS.rating === 'needs-improvement' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {webVitals.CLS ? webVitals.CLS.rating : 'Loading...'}
            </div>
            <div className="text-xs text-slate-500 mt-2">Layout Shift</div>
          </div>

          {/* INP - Interaction to Next Paint */}
          <div className="border rounded-lg p-4">
            <div className="text-xs text-slate-500 font-medium mb-1">INP</div>
            <div className="text-2xl font-bold text-slate-900">
              {webVitals.INP ? Math.round(webVitals.INP.value) : '-'}
              {webVitals.INP && <span className="text-sm"> ms</span>}
            </div>
            <div className={`text-xs mt-1 font-medium ${
              !webVitals.INP ? 'text-slate-400' :
              webVitals.INP.rating === 'good' ? 'text-green-600' :
              webVitals.INP.rating === 'needs-improvement' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {webVitals.INP ? webVitals.INP.rating : 'Loading...'}
            </div>
            <div className="text-xs text-slate-500 mt-2">Interaction</div>
          </div>

          {/* FCP - First Contentful Paint */}
          <div className="border rounded-lg p-4">
            <div className="text-xs text-slate-500 font-medium mb-1">FCP</div>
            <div className="text-2xl font-bold text-slate-900">
              {webVitals.FCP ? Math.round(webVitals.FCP.value) : '-'}
              {webVitals.FCP && <span className="text-sm"> ms</span>}
            </div>
            <div className={`text-xs mt-1 font-medium ${
              !webVitals.FCP ? 'text-slate-400' :
              webVitals.FCP.rating === 'good' ? 'text-green-600' :
              webVitals.FCP.rating === 'needs-improvement' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {webVitals.FCP ? webVitals.FCP.rating : 'Loading...'}
            </div>
            <div className="text-xs text-slate-500 mt-2">First Paint</div>
          </div>

          {/* LCP - Largest Contentful Paint */}
          <div className="border rounded-lg p-4">
            <div className="text-xs text-slate-500 font-medium mb-1">LCP</div>
            <div className="text-2xl font-bold text-slate-900">
              {webVitals.LCP ? Math.round(webVitals.LCP.value) : '-'}
              {webVitals.LCP && <span className="text-sm"> ms</span>}
            </div>
            <div className={`text-xs mt-1 font-medium ${
              !webVitals.LCP ? 'text-slate-400' :
              webVitals.LCP.rating === 'good' ? 'text-green-600' :
              webVitals.LCP.rating === 'needs-improvement' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {webVitals.LCP ? webVitals.LCP.rating : 'Loading...'}
            </div>
            <div className="text-xs text-slate-500 mt-2">Largest Paint</div>
          </div>

          {/* TTFB - Time to First Byte */}
          <div className="border rounded-lg p-4">
            <div className="text-xs text-slate-500 font-medium mb-1">TTFB</div>
            <div className="text-2xl font-bold text-slate-900">
              {webVitals.TTFB ? Math.round(webVitals.TTFB.value) : '-'}
              {webVitals.TTFB && <span className="text-sm"> ms</span>}
            </div>
            <div className={`text-xs mt-1 font-medium ${
              !webVitals.TTFB ? 'text-slate-400' :
              webVitals.TTFB.rating === 'good' ? 'text-green-600' :
              webVitals.TTFB.rating === 'needs-improvement' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {webVitals.TTFB ? webVitals.TTFB.rating : 'Loading...'}
            </div>
            <div className="text-xs text-slate-500 mt-2">First Byte</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-slate-700">
            <span className="font-semibold">Core Web Vitals:</span> Metrics that measure real-world user experience. 
            <span className="text-green-600 font-medium"> Good</span>, 
            <span className="text-yellow-600 font-medium"> Needs Improvement</span>, or 
            <span className="text-red-600 font-medium"> Poor</span> ratings help identify performance issues.
          </p>
        </div>
      </Card>

      {/* Backend Performance Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-slate-900">Backend Performance</h2>
        </div>

        {backendLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-slate-600">Loading backend metrics...</p>
          </div>
        ) : backendError ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">{backendError}</p>
            <button 
              onClick={fetchBackendPerformance}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : backendPerformance ? (
          <>
            {/* Health Status */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">System Health</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Status: <span className="text-green-600 font-medium">{backendPerformance.health?.status || 'Unknown'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{backendPerformance.health?.dbQueryTime || 'N/A'}</div>
                  <div className="text-xs text-slate-600">DB Query Time</div>
                </div>
              </div>
            </div>

            {/* Node.js Metrics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Node.js Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Uptime */}
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-slate-500 font-medium mb-1">Uptime</div>
                  <div className="text-xl font-bold text-slate-900">
                    {backendPerformance.nodejs?.uptime || 'N/A'}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">Server Running</div>
                </div>

                {/* Version */}
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-slate-500 font-medium mb-1">Node Version</div>
                  <div className="text-xl font-bold text-slate-900">
                    {backendPerformance.nodejs?.version || 'N/A'}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    {backendPerformance.nodejs?.platform} • {backendPerformance.nodejs?.arch}
                  </div>
                </div>

                {/* CPU Usage */}
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-slate-500 font-medium mb-1">CPU Usage</div>
                  <div className="text-xl font-bold text-slate-900">
                    {backendPerformance.nodejs?.cpuUsage?.user || 'N/A'}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    System: {backendPerformance.nodejs?.cpuUsage?.system || 'N/A'}
                  </div>
                </div>

                {/* Memory RSS */}
                <div className="border rounded-lg p-4">
                  <div className="text-xs text-slate-500 font-medium mb-1">Memory (RSS)</div>
                  <div className="text-xl font-bold text-slate-900">
                    {backendPerformance.nodejs?.memoryUsage?.rss || 'N/A'}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">Resident Set Size</div>
                </div>
              </div>

              {/* Memory Details */}
              <div className="border rounded-lg p-4">
                <div className="text-xs text-slate-500 font-medium mb-3">Memory Breakdown</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {backendPerformance.nodejs?.memoryUsage?.heapTotal || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-600">Heap Total</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {backendPerformance.nodejs?.memoryUsage?.heapUsed || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-600">Heap Used</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {backendPerformance.nodejs?.memoryUsage?.external || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-600">External</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-600">No performance data available</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ProtectedDashboardPage() {
  return (
    <SuperAdminGuard>
      <DashboardPage />
    </SuperAdminGuard>
  );
}