"use client"

import * as React from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { apiRequest, getAuthToken } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Users, AlertCircle, RefreshCw } from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  role: "customer" | "owner" | "admin"
  createdAt: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
}

const ROLES = ["customer", "owner", "admin"] as const
type Role = (typeof ROLES)[number]

function getRoleLabel(role: Role): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function AdminUsersPage() {
  const { backendProfile, isPending: authPending } = useAuthSession()
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  async function fetchUsers() {
    setIsLoading(true)
    setError(null)
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication required. Please sign in again.")
      }
      const response = await apiRequest("/api/admin/users", { token })
      const data: ApiResponse<{ users: User[] }> = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to fetch users")
      }
      setUsers(data.data?.users || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch users"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (!authPending) {
      // Use a callback to avoid synchronous state update in effect
      const timer = setTimeout(() => {
        fetchUsers()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [authPending])

  async function handleRoleChange(userId: string, newRole: Role) {
    if (updatingId) return

    setUpdatingId(userId)
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication required. Please sign in again.")
      }
      const response = await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
        token,
      })
      const data: ApiResponse<{ user: User }> = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update user role")
      }
      toast.success("Role updated successfully")
      await fetchUsers()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user role"
      toast.error(message)
    } finally {
      setUpdatingId(null)
    }
  }

  function handleSelectChange(userId: string, newRole: Role) {
    const user = users.find((u) => u.id === userId)
    if (user && user.role !== newRole) {
      handleRoleChange(userId, newRole)
    }
  }

  if (authPending) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (backendProfile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You do not have permission to access the Admin Dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">All Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage user roles and view registered users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <CardTitle>Registered Users</CardTitle>
          </div>
          <CardDescription>
            View and manage roles for all registered users in the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-[140px]" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Failed to load users</h3>
              <p className="text-muted-foreground mb-4 max-w-md">{error}</p>
              <Button variant="outline" onClick={fetchUsers} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground">There are no registered users in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="w-[160px]">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted">
                          {getRoleLabel(user.role)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleSelectChange(user.id, value as Role)}
                          disabled={updatingId === user.id}
                        >
                          <SelectTrigger className="w-[140px]" data-placeholder="Select role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {getRoleLabel(role)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {updatingId === user.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}