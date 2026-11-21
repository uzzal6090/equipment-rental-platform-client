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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Package, AlertCircle, RefreshCw, Eye, Edit, Trash2, ChevronLeft, ChevronRight, MoreHorizontal, DollarSign } from "lucide-react"
import { ALLOWED_CATEGORIES, ALLOWED_RENTAL_TYPES, ALLOWED_CONDITIONS } from "@/constants/equipment-validation"
import Link from "next/link"

type Equipment = {
  id: string
  name: string
  category: string
  rentalPrice: number
  rentalType: string
  location: string
  availableQuantity: number
  image: string | null
  status: "pending" | "approved" | "rejected"
  featured: boolean
  createdAt: string
  updatedAt: string
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
    errors?: Array<{ field: string; message: string }>
  }
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusColor(status: string): string {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

function getRentalTypeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

type EquipmentFormData = {
  name?: string
  description?: string
  category?: string
  location?: string
  rentalPrice?: number
  rentalType?: string
  totalQuantity?: number
  condition?: string
  brand?: string
  model?: string
  image?: string
  rentalTerms?: string
}

export default function MyEquipmentPage() {
  const { backendProfile, isPending: authPending } = useAuthSession()
  const [equipment, setEquipment] = React.useState<Equipment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingEquipment, setEditingEquipment] = React.useState<Equipment | null>(null)
  const [editFormData, setEditFormData] = React.useState<EquipmentFormData>({})
  const [editErrors, setEditErrors] = React.useState<Record<string, string>>({})
  const [isEditSubmitting, setIsEditSubmitting] = React.useState(false)

  const fetchEquipment = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication required. Please sign in again.")
      }
      const params = new URLSearchParams()
      params.set("page", String(pagination.page))
      params.set("limit", String(pagination.limit))

      const response = await apiRequest(`/api/equipment/owner/me?${params.toString()}`, { token })
      const data: ApiResponse<{ equipment: Equipment[]; pagination: Pagination }> = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to fetch equipment")
      }
      setEquipment(data.data?.equipment || [])
      setPagination((prev) => data.data?.pagination || prev)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch equipment"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit])

  React.useEffect(() => {
    if (!authPending) {
      const timer = setTimeout(() => {
        fetchEquipment()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [authPending, fetchEquipment])

  async function handleDelete(id: string) {
    if (deletingId) return

    setDeletingId(id)
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication required. Please sign in again.")
      }
      const response = await apiRequest(`/api/equipment/${id}`, {
        method: "DELETE",
        token,
      })
      const data: ApiResponse<{ deleted: boolean; id: string }> = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete equipment")
      }
      toast.success("Equipment deleted successfully")
      await fetchEquipment()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete equipment"
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  function openEditDialog(eq: Equipment) {
    setEditingEquipment(eq)
    setEditFormData({
      name: eq.name,
      description: "",
      category: eq.category,
      location: eq.location,
      rentalPrice: eq.rentalPrice,
      rentalType: eq.rentalType,
      totalQuantity: eq.availableQuantity,
      condition: "good",
      brand: "",
      model: "",
      image: eq.image || "",
      rentalTerms: "",
    })
    setEditErrors({})
    setEditDialogOpen(true)
  }

  function handleEditInputChange(field: string, value: string | number | boolean | null) {
    setEditFormData((prev) => ({ ...prev, [field]: value ?? "" }))
    if (editErrors[field]) {
      setEditErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  async function handleEditSubmit() {
    if (!editingEquipment || isEditSubmitting) return

    setIsEditSubmitting(true)
    setEditErrors({})
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication required. Please sign in again.")
      }

      const submitData: Record<string, unknown> = {}
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          if (key === "rentalPrice" || key === "totalQuantity") {
            submitData[key] = Number(value)
          } else {
            submitData[key] = value
          }
        }
      })

      const response = await apiRequest(`/api/equipment/${editingEquipment.id}`, {
        method: "PUT",
        body: JSON.stringify(submitData),
        token,
      })
      const data: ApiResponse<{ equipment: Equipment }> = await response.json()
      if (!response.ok || !data.success) {
        if (data.error?.errors) {
          const fieldErrors: Record<string, string> = {}
          data.error.errors.forEach((e) => {
            fieldErrors[e.field] = e.message
          })
          setEditErrors(fieldErrors)
        }
        throw new Error(data.error?.message || "Failed to update equipment")
      }
      toast.success("Equipment updated successfully")
      setEditDialogOpen(false)
      setEditingEquipment(null)
      await fetchEquipment()
    } catch (err) {
      if (!err || (err instanceof Error && !editErrors)) {
        const message = err instanceof Error ? err.message : "Failed to update equipment"
        toast.error(message)
      }
    } finally {
      setIsEditSubmitting(false)
    }
  }

  function handleFilterChange(key: "page" | "limit", value: number) {
    if (key === "page") {
      setPagination((prev) => ({ ...prev, page: value }))
    } else if (key === "limit") {
      setPagination((prev) => ({ ...prev, limit: value, page: 1 }))
    }
  }

  if (authPending) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (backendProfile?.role !== "owner") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You do not have permission to access the Owner Dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Equipment</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your equipment listings across all statuses.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/owner/add-equipment"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            <Package className="h-4 w-4" />
            Add Equipment
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              <CardTitle>Equipment Listings</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEquipment}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                Refresh
              </Button>
            </div>
          </div>
          <CardDescription>
            {pagination.total} equipment total · Page {pagination.page} of {pagination.totalPages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rental Price</TableHead>
                    <TableHead>Available Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Failed to load equipment</h3>
              <p className="text-muted-foreground mb-4 max-w-md">{error}</p>
              <Button variant="outline" onClick={fetchEquipment} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : equipment.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No equipment found</h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any equipment listings yet.
              </p>
              <Link
                href="/dashboard/owner/add-equipment"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
              >
                <Package className="h-4 w-4" />
                Add your first equipment
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipment Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rental Price</TableHead>
                      <TableHead>Available Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipment.map((eq) => (
                      <TableRow key={eq.id}>
                        <TableCell className="font-medium max-w-xs truncate">{eq.name}</TableCell>
                        <TableCell>{eq.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            {formatPrice(eq.rentalPrice)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{eq.availableQuantity}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(eq.status)}`}>
                            {getStatusLabel(eq.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <div className="group/button inline-flex shrink-0 items-center justify-center rounded-lg text-foreground opacity-60 hover:bg-muted hover:opacity-100 transition-colors h-8 w-8" tabIndex={0} role="button" aria-label="Actions">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(eq.id)}>
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(eq)}>
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(eq.id)}
                                disabled={deletingId === eq.id}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {(deletingId === eq.id) && (
                            <Loader2 className="absolute h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Select value={String(pagination.limit)} onValueChange={(v) => handleFilterChange("limit", Number(v))}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange("page", pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange("page", pagination.page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>
              Update the equipment details below. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editFormData.name || ""}
                onChange={(e) => handleEditInputChange("name", e.target.value)}
                disabled={isEditSubmitting}
                className={editErrors.name ? "border-destructive" : ""}
              />
              {editErrors.name && <p className="text-sm text-destructive">{editErrors.name}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-description">Description *</Label>
              <textarea
                id="edit-description"
                value={editFormData.description || ""}
                onChange={(e) => handleEditInputChange("description", e.target.value)}
                disabled={isEditSubmitting}
                className={`w-full min-h-[100px] rounded-lg border px-2.5 py-1 text-base transition-colors ${editErrors.description ? "border-destructive" : "border-input"}`}
              />
              {editErrors.description && <p className="text-sm text-destructive">{editErrors.description}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value={editFormData.category || ""}
                onValueChange={(v) => handleEditInputChange("category", v)}
                disabled={isEditSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editErrors.category && <p className="text-sm text-destructive">{editErrors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                value={editFormData.location || ""}
                onChange={(e) => handleEditInputChange("location", e.target.value)}
                disabled={isEditSubmitting}
                className={editErrors.location ? "border-destructive" : ""}
              />
              {editErrors.location && <p className="text-sm text-destructive">{editErrors.location}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rentalPrice">Rental Price *</Label>
              <Input
                id="edit-rentalPrice"
                type="number"
                min="0"
                step="1"
                value={editFormData.rentalPrice || ""}
                onChange={(e) => handleEditInputChange("rentalPrice", e.target.value)}
                disabled={isEditSubmitting}
                className={editErrors.rentalPrice ? "border-destructive" : ""}
              />
              {editErrors.rentalPrice && <p className="text-sm text-destructive">{editErrors.rentalPrice}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rentalType">Rental Type *</Label>
              <Select
                value={editFormData.rentalType || ""}
                onValueChange={(v) => handleEditInputChange("rentalType", v)}
                disabled={isEditSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rental type" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_RENTAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getRentalTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editErrors.rentalType && <p className="text-sm text-destructive">{editErrors.rentalType}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-totalQuantity">Total Quantity *</Label>
              <Input
                id="edit-totalQuantity"
                type="number"
                min="1"
                step="1"
                value={editFormData.totalQuantity || ""}
                onChange={(e) => handleEditInputChange("totalQuantity", e.target.value)}
                disabled={isEditSubmitting}
                className={editErrors.totalQuantity ? "border-destructive" : ""}
              />
              {editErrors.totalQuantity && <p className="text-sm text-destructive">{editErrors.totalQuantity}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-condition">Condition *</Label>
              <Select
                value={editFormData.condition || ""}
                onValueChange={(v) => handleEditInputChange("condition", v)}
                disabled={isEditSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editErrors.condition && <p className="text-sm text-destructive">{editErrors.condition}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Brand</Label>
              <Input
                id="edit-brand"
                value={editFormData.brand || ""}
                onChange={(e) => handleEditInputChange("brand", e.target.value)}
                disabled={isEditSubmitting}
                placeholder="Optional"
              />
              {editErrors.brand && <p className="text-sm text-destructive">{editErrors.brand}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Model</Label>
              <Input
                id="edit-model"
                value={editFormData.model || ""}
                onChange={(e) => handleEditInputChange("model", e.target.value)}
                disabled={isEditSubmitting}
                placeholder="Optional"
              />
              {editErrors.model && <p className="text-sm text-destructive">{editErrors.model}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                type="url"
                value={editFormData.image || ""}
                onChange={(e) => handleEditInputChange("image", e.target.value)}
                disabled={isEditSubmitting}
                placeholder="https://example.com/image.jpg"
              />
              {editErrors.image && <p className="text-sm text-destructive">{editErrors.image}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-rentalTerms">Rental Terms</Label>
              <textarea
                id="edit-rentalTerms"
                value={editFormData.rentalTerms || ""}
                onChange={(e) => handleEditInputChange("rentalTerms", e.target.value)}
                disabled={isEditSubmitting}
                className="w-full min-h-[80px] rounded-lg border border-input px-2.5 py-1 text-base"
                placeholder="Optional"
              />
              {editErrors.rentalTerms && <p className="text-sm text-destructive">{editErrors.rentalTerms}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isEditSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isEditSubmitting}>
              {isEditSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this equipment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={deletingId === null}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deletingId && handleDelete(deletingId)} disabled={deletingId === null}>
              {deletingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function handleViewDetails(id: string) {
  window.open(`/equipment/${id}`, "_blank")
}