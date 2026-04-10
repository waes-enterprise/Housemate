'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Tag, Plus, Edit, Trash2, GripVertical, Loader2,
  BedDouble, Wheat, Building2, Archive, PartyPopper, Car, Warehouse, Mountain, Store, CircleParking, MoreHorizontal,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { EmptyState } from '@/components/admin/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { type LucideIcon } from 'lucide-react'

// Icon registry: map icon name strings to Lucide components
const iconRegistry: Record<string, LucideIcon> = {
  BedDouble,
  Wheat,
  Building2,
  Archive,
  PartyPopper,
  Car,
  Warehouse,
  Mountain,
  Store,
  CircleParking,
  MoreHorizontal,
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  sortOrder: number
  isActive: boolean
  _count: { listings: number }
}

const defaultForm = {
  name: '',
  slug: '',
  icon: 'Building2',
  sortOrder: 0,
  isActive: true,
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch {
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  function openCreate() {
    setEditingId(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success(editingId ? 'Category updated' : 'Category created')
        setDialogOpen(false)
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save category')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const cat = categories.find((c) => c.id === deleteId)
      const res = await fetch(`/api/admin/categories/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Category deleted')
        fetchCategories()
      } else {
        const data = await res.json()
        if (cat && cat._count.listings > 0) {
          setDeleteError(`Cannot delete category with ${cat._count.listings} listings. Reassign listings first.`)
        } else {
          setDeleteError(data.error || 'Failed to delete category')
        }
      }
    } catch {
      setDeleteError('Failed to delete category')
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const cat = categories.find((c) => c.id === id)
      if (!cat) return
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cat.name, slug: cat.slug, icon: cat.icon, sortOrder: cat.sortOrder, isActive: !isActive }),
      })
      if (res.ok) {
        fetchCategories()
      } else {
        toast.error('Failed to toggle category')
      }
    } catch {
      toast.error('Failed to toggle category')
    }
  }

  async function handleSortOrder(id: string, order: number) {
    try {
      const cat = categories.find((c) => c.id === id)
      if (!cat) return
      await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cat.name, slug: cat.slug, icon: cat.icon, sortOrder: order, isActive: cat.isActive }),
      })
      fetchCategories()
    } catch {
      // silently ignore
    }
  }

  function updateForm(key: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'name' && !editingId) {
      setForm((prev) => ({
        ...prev,
        slug: value.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }))
    }
  }

  function renderIcon(iconName: string) {
    const IconComponent = iconRegistry[iconName]
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />
    }
    // Fallback: show the icon name in a badge
    return <Badge variant="outline" className="text-xs font-mono">{iconName}</Badge>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage property listing categories"
        icon={Tag}
        action={
          <Button
            onClick={openCreate}
            className="bg-[#006633] hover:bg-[#004d26] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead className="hidden lg:table-cell">Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Listings</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState
                      icon={Tag}
                      title="No categories yet"
                      description="Create your first category to organize property listings."
                      action={
                        <Button onClick={openCreate} className="bg-[#006633] hover:bg-[#004d26] text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Category
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-gray-300" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                        {renderIcon(cat.icon)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-gray-900">{cat.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">{cat.slug}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Input
                        type="number"
                        value={cat.sortOrder}
                        onChange={(e) => {
                          const val = parseInt(e.target.value)
                          if (!isNaN(val)) handleSortOrder(cat.id, val)
                        }}
                        className="w-20 h-8 text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={cat.isActive ? 'active' : 'archived'} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center text-sm font-medium">
                      {cat._count.listings}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(cat)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(cat.id, cat.isActive)}>
                            {cat.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              if (cat._count.listings > 0) {
                                setDeleteError(`Cannot delete category with ${cat._count.listings} listings. Reassign listings first.`)
                              } else {
                                setDeleteError(null)
                              }
                              setDeleteId(cat.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the category details below.' : 'Fill in the details for the new category.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="e.g., Rooms"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., rooms (auto-generated from name)"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-icon">Icon Name</Label>
              <Input
                id="cat-icon"
                value={form.icon}
                onChange={(e) => updateForm('icon', e.target.value)}
                placeholder="e.g., Building2"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Available: BedDouble, Wheat, Building2, Archive, PartyPopper, Car, Warehouse, Mountain, Store, CircleParking
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-sort">Sort Order</Label>
              <Input
                id="cat-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => updateForm('sortOrder', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cat-active">Active</Label>
              <Switch id="cat-active" checked={form.isActive} onCheckedChange={(v) => updateForm('isActive', v)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="bg-[#006633] hover:bg-[#004d26] text-white"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                editingId ? 'Update Category' : 'Create Category'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId && !!deleteError} onOpenChange={(open) => { if (!open) { setDeleteId(null); setDeleteError(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Delete Category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-red-600">{deleteError}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteId(null); setDeleteError(null) }}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId && !deleteError}
        onOpenChange={() => { setDeleteId(null); setDeleteError(null) }}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}
