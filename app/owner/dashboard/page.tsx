
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2, 
  UtensilsIcon, 
  PlusCircle, 
  MessageSquare, 
  BarChart3,
  Eye,
  Users,
  TrendingUp,
  Clock
} from "lucide-react";

export default async function OwnerDashboard() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const userType = (session.user as any)?.userType;
  if (userType !== 'PROPERTY_OWNER') {
    redirect('/student/dashboard');
  }

  const userName = session.user?.name?.split(' ')[0] || 'Owner';

  const quickStats = [
    { label: 'Active Listings', value: '5', icon: Building2, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Views', value: '247', icon: Eye, color: 'bg-green-50 text-green-600' },
    { label: 'New Inquiries', value: '8', icon: MessageSquare, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'This Month Revenue', value: '₹45K', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' }
  ];

  const recentInquiries = [
    {
      id: 1,
      studentName: "Rahul Sharma",
      property: "Cozy PG near Campus",
      message: "Interested in visiting the property this weekend...",
      time: "2 hours ago",
      status: "pending"
    },
    {
      id: 2,
      studentName: "Priya Patel",
      property: "South Indian Tiffin Service",
      message: "What are the meal timings and menu options?",
      time: "5 hours ago",
      status: "pending"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 🏢
          </h1>
          <p className="text-gray-600">
            Manage your listings and connect with students looking for accommodation and food services.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Manage your business efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/owner/add-listing">
                <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 flex flex-col space-y-2">
                  <PlusCircle className="h-6 w-6" />
                  <span>Add New Listing</span>
                </Button>
              </Link>
              
              <Link href="/owner/listings">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50">
                  <Building2 className="h-6 w-6" />
                  <span>Manage Listings</span>
                </Button>
              </Link>
              
              <Link href="/owner/inquiries">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50">
                  <MessageSquare className="h-6 w-6" />
                  <span>View Inquiries</span>
                </Button>
              </Link>
              
              <Link href="/owner/analytics">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50">
                  <BarChart3 className="h-6 w-6" />
                  <span>Analytics</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Inquiries */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Recent Inquiries</CardTitle>
                    <CardDescription>New messages from students</CardDescription>
                  </div>
                  <Link href="/owner/inquiries">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{inquiry.studentName}</h4>
                          <p className="text-sm text-blue-600">{inquiry.property}</p>
                        </div>
                        <span className="text-xs text-gray-500">{inquiry.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{inquiry.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          Pending Response
                        </span>
                        <Button size="sm" variant="outline">Respond</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Tips */}
          <div>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Business Tips</CardTitle>
                <CardDescription>Grow your business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-blue-900">Respond Quickly</h4>
                        <p className="text-sm text-blue-700">Fast responses increase your booking chances by 60%.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Eye className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-green-900">Update Photos</h4>
                        <p className="text-sm text-green-700">High-quality photos get 3x more inquiries.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <BarChart3 className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-purple-900">Track Performance</h4>
                        <p className="text-sm text-purple-700">Monitor your listings' performance regularly.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
