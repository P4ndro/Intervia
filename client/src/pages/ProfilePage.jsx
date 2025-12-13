import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  MapPin, 
  User, 
  Users, 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../authContext';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user } = useAuth();

  // Mock Data for Charts
  const weeklyData = [
    { day: 'Mon', score: 65, average: 40 },
    { day: 'Tue', score: 59, average: 45 },
    { day: 'Wed', score: 80, average: 55 },
    { day: 'Thu', score: 81, average: 60 },
    { day: 'Fri', score: 56, average: 70 },
    { day: 'Sat', score: 95, average: 75 },
    { day: 'Sun', score: 60, average: 65 },
  ];

  const monthlyData = [
    { month: 'May', activity: 40 },
    { month: 'Jun', activity: 20 },
    { month: 'Jul', activity: 55 },
    { month: 'Aug', activity: 80 },
    { month: 'Sep', activity: 65 },
    { month: 'Oct', activity: 30 },
    { month: 'Nov', activity: 25 },
    { month: 'Dec', activity: 90 },
  ];

  const historyData = [
    { id: 1, title: 'Interview with Tech Corp', date: 'Oct 18, 2023' },
    { id: 2, title: 'Mock Interview - Behavioral', date: 'Oct 16, 2023' },
    { id: 3, title: 'Interview with DataInc', date: 'Oct 14, 2023' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* ==========================================
              1. PROFILE & ACHIEVEMENTS SECTION (TOP)
             ========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center border border-gray-200">
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <img 
                  src="/api/placeholder/150/150" 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.email?.split('@')[0] || 'Jordan Smith'}</h2>
              <div className="flex items-center text-gray-600 text-sm mt-1 mb-6">
                <MapPin size={16} className="mr-1" />
                <span>San Francisco</span>
              </div>
              
              {/* Mini Stat Row */}
              <div className="flex justify-between w-full px-4 py-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-gray-900">3</span>
                  <span className="text-xs text-gray-600">My sessions</span>
                </div>
                <div className="w-px bg-gray-200 mx-2"></div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-gray-900">2</span>
                  <span className="text-xs text-gray-600">Connections</span>
                </div>
                <div className="w-px bg-gray-200 mx-2"></div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-gray-900">15</span>
                  <span className="text-xs text-gray-600">Following</span>
                </div>
              </div>
            </div>

            {/* Right Column: Key Stats & Achievements */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Key Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stat 1 */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                  <TrendingUp className="text-blue-600 mb-2" size={24} />
                  <span className="text-sm text-gray-600 mb-1">Completed interviews</span>
                  <span className="text-2xl font-bold text-gray-900">3</span>
                </div>
                {/* Stat 2 */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                  <Clock className="text-purple-600 mb-2" size={24} />
                  <span className="text-sm text-gray-600 mb-1">Hours practiced</span>
                  <span className="text-2xl font-bold text-gray-900">40</span>
                </div>
                {/* Stat 3 */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                  <Target className="text-green-600 mb-2" size={24} />
                  <span className="text-sm text-gray-600 mb-1">Skills practiced</span>
                  <span className="text-2xl font-bold text-gray-900">7</span>
                </div>
              </div>

              {/* Achievements Stack */}
              <div className="flex flex-col gap-4">
                {/* Achievement 1 */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Star className="text-yellow-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-gray-900">Dedicated Practitioner</h3>
                      <span className="text-sm font-medium text-gray-600">5/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '71%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600">Achieve a 7-day streak</p>
                  </div>
                </div>

                {/* Achievement 2 */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Trophy className="text-indigo-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-gray-900">Point Accumulator</h3>
                      <span className="text-sm font-medium text-gray-600">1500/5000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600">Earn 3500 more points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* ==========================================
              2. DETAILED METRICS SECTION (MIDDLE)
             ========================================== */}
          <div>
            {/* Summary Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
                <h3 className="text-2xl font-bold text-gray-900">34</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <h3 className="text-2xl font-bold text-gray-900">85%</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">Improvement</p>
                <h3 className="text-2xl font-bold text-green-600">15%</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">Last Practice</p>
                <h3 className="text-2xl font-bold text-gray-900">Oct 20, 2023</h3>
              </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Performance Line Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-6">Weekly Performance</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6b7280', fontSize: 12}} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#e5e7eb" 
                        strokeWidth={3} 
                        dot={false} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#111827" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#111827', strokeWidth: 0 }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Performance Bar Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-6">Monthly Performance</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6b7280', fontSize: 12}} 
                        dy={10}
                      />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar 
                        dataKey="activity" 
                        fill="#111827" 
                        radius={[4, 4, 0, 0]} 
                        stackId="a"
                      />
                      <Bar 
                        dataKey="activity" 
                        fill="#374151" 
                        fillOpacity={0.3}
                        radius={[0, 0, 0, 0]} 
                        stackId="a" 
                      /> 
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center mb-10">
              <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200">
                Start New Interview
              </button>
            </div>
          </div>

          {/* ==========================================
              3. HISTORY SECTION (BOTTOM)
             ========================================== */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Interview History</h3>
            <div className="space-y-3">
              {historyData.map((item) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full border border-gray-200">
                      <Award size={16} className="text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-900">{item.title}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
  
};

export default ProfilePage;

