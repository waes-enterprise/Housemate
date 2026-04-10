'use client'

import { useEffect, useState } from 'react'
import { Settings, Loader2, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface SiteSettings {
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  default_currency: string
  listings_per_page: string
  allow_user_listings: string
  require_listing_approval: string
  allow_registration: string
  maintenance_mode: string
}

const defaults: SiteSettings = {
  site_name: 'Housemate ZM',
  site_description: '',
  contact_email: '',
  contact_phone: '',
  default_currency: 'ZMW - Zambian Kwacha',
  listings_per_page: '20',
  allow_user_listings: 'true',
  require_listing_approval: 'false',
  allow_registration: 'true',
  maintenance_mode: 'false',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }))
          }
        }
      } catch {
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        toast.success('Settings saved successfully')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save settings')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  function updateSetting(key: keyof SiteSettings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Configure your marketplace preferences" icon={Settings} />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your marketplace preferences" icon={Settings} />

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border p-6 shadow-sm space-y-6">

          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">Basic information about your marketplace</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => updateSetting('site_name', e.target.value)}
                placeholder="Housemate ZM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => updateSetting('site_description', e.target.value)}
                placeholder="A brief description of your marketplace..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => updateSetting('contact_email', e.target.value)}
                  placeholder="admin@housematezm.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={settings.contact_phone}
                  onChange={(e) => updateSetting('contact_phone', e.target.value)}
                  placeholder="+260 XXX XXX XXX"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Currency & Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Currency &amp; Pricing</h3>
            <p className="text-sm text-muted-foreground mt-1">Configure the default currency for your marketplace</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_currency">Default Currency</Label>
              <Input
                id="default_currency"
                value={settings.default_currency}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
          </div>

          <Separator />

          {/* Listings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Listings</h3>
            <p className="text-sm text-muted-foreground mt-1">Control how listings behave on your platform</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="listings_per_page">Listings Per Page</Label>
              <Input
                id="listings_per_page"
                type="number"
                value={settings.listings_per_page}
                onChange={(e) => updateSetting('listings_per_page', e.target.value)}
                min={1}
                max={100}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Allow User Listings</Label>
                <p className="text-sm text-muted-foreground">Users can create and manage their own listings</p>
              </div>
              <Switch
                checked={settings.allow_user_listings === 'true'}
                onCheckedChange={(v) => updateSetting('allow_user_listings', String(v))}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Require Listing Approval</Label>
                <p className="text-sm text-muted-foreground">New listings start with &quot;pending&quot; status and must be approved by admin</p>
              </div>
              <Switch
                checked={settings.require_listing_approval === 'true'}
                onCheckedChange={(v) => updateSetting('require_listing_approval', String(v))}
              />
            </div>
          </div>

          <Separator />

          {/* Registration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Registration</h3>
            <p className="text-sm text-muted-foreground mt-1">Control user registration settings</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Allow User Registration</Label>
                <p className="text-sm text-muted-foreground">New users can create accounts on the platform</p>
              </div>
              <Switch
                checked={settings.allow_registration === 'true'}
                onCheckedChange={(v) => updateSetting('allow_registration', String(v))}
              />
            </div>
          </div>

          <Separator />

          {/* Maintenance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Maintenance</h3>
            <p className="text-sm text-muted-foreground mt-1">Control site availability</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between py-2 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label>Maintenance Mode</Label>
                  {settings.maintenance_mode === 'true' && (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">When enabled, the site shows a maintenance message to visitors</p>
              </div>
              <Switch
                checked={settings.maintenance_mode === 'true'}
                onCheckedChange={(v) => updateSetting('maintenance_mode', String(v))}
              />
            </div>
          </div>

          <Separator />

          {/* Save */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              className="bg-[#006633] hover:bg-[#004d26] text-white"
              disabled={saving}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
