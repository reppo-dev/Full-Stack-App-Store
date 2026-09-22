"use client";

import { useEffect, useState } from "react";
import { bannersApi, CreateBannerPayload, UpdateBannerPayload } from "@/features/banners/api/banners.client";
import { Banner } from "@/models/modles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Sliders,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface BannerFormData {
  title: string;
  subtitle: string;
  badge: string;
  image_url: string;
  link_url: string;
  cta_text: string;
  cta_link: string;
  type: "hero" | "promo";
  position: number;
  is_active: boolean;
}

const defaultFormData: BannerFormData = {
  title: "",
  subtitle: "",
  badge: "",
  image_url: "",
  link_url: "/product",
  cta_text: "Shop Now",
  cta_link: "/product",
  type: "hero",
  position: 0,
  is_active: true,
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "hero" | "promo">("all");
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirm dialog
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await bannersApi.listAllAdmin();
      setBanners(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenCreate = (preselectedType?: "hero" | "promo") => {
    setEditingBannerId(null);
    setFormData({
      ...defaultFormData,
      type: preselectedType || (activeTab === "promo" ? "promo" : "hero"),
      position: banners.filter((b) => b.type === (preselectedType || "hero")).length,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      badge: banner.badge || "",
      image_url: banner.image_url,
      link_url: banner.link_url,
      cta_text: banner.cta_text,
      cta_link: banner.cta_link,
      type: (banner.type as "hero" | "promo") || "hero",
      position: banner.position,
      is_active: banner.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please provide a banner title");
      return;
    }
    if (!formData.image_url.trim()) {
      toast.error("Please provide a banner image URL");
      return;
    }

    setSubmitting(true);
    try {
      if (editingBannerId) {
        await bannersApi.update(editingBannerId, formData);
        toast.success("Banner updated successfully");
      } else {
        await bannersApi.create(formData);
        toast.success("Banner created successfully");
      }
      setIsDialogOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || "Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const updatedStatus = !banner.is_active;
      await bannersApi.update(banner.id, { is_active: updatedStatus });
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: updatedStatus } : b))
      );
      toast.success(`Banner ${updatedStatus ? "activated" : "deactivated"}`);
    } catch (err: any) {
      toast.error("Failed to toggle banner status");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bannersApi.delete(id);
      toast.success("Banner deleted successfully");
      setDeleteConfirmId(null);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete banner");
    }
  };

  const filteredBanners = banners.filter((b) => {
    if (activeTab === "hero") return b.type === "hero";
    if (activeTab === "promo") return b.type === "promo";
    return true;
  });

  const heroCount = banners.filter((b) => b.type === "hero" && b.is_active).length;
  const promoCount = banners.filter((b) => b.type === "promo" && b.is_active).length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/product"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Products & Catalog
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-semibold text-blue-600">Banners Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Sliders className="h-8 w-8 text-blue-600" />
            Storefront Banners & Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control the interactive banners, click destinations, and CTA buttons on the home landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBanners}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => handleOpenCreate()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add New Banner
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Total Managed
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{banners.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Database banners</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Active Hero Sliders
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{heroCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Live on Home Hero</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Active Promo Cards
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{promoCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Live on Promo Grid</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <ImageIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="all" className="text-xs font-semibold px-4">
              All Banners ({banners.length})
            </TabsTrigger>
            <TabsTrigger value="hero" className="text-xs font-semibold px-4">
              Hero Sliders ({banners.filter((b) => b.type === "hero").length})
            </TabsTrigger>
            <TabsTrigger value="promo" className="text-xs font-semibold px-4">
              Promo Grid ({banners.filter((b) => b.type === "promo").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <p className="text-xs text-muted-foreground">
          Showing {filteredBanners.length} banners
        </p>
      </div>

      {/* Banners Grid List */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="text-sm text-muted-foreground">Loading storefront banners...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center bg-card">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No Banners Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            You don't have any banners matching this filter. Create your first banner to display it on the store!
          </p>
          <Button
            onClick={() => handleOpenCreate()}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Banner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-card border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                banner.is_active ? "border-border" : "border-dashed border-muted-foreground/30 opacity-70"
              }`}
            >
              {/* Banner Visual Preview */}
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden group">
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-95"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* Badges on Top */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge
                    className={
                      banner.type === "hero"
                        ? "bg-blue-600 text-white text-xs font-bold uppercase tracking-wider"
                        : "bg-purple-600 text-white text-xs font-bold uppercase tracking-wider"
                    }
                  >
                    {banner.type === "hero" ? "Hero Slider" : "Promo Card"}
                  </Badge>

                  {banner.badge && (
                    <Badge variant="secondary" className="bg-amber-400/90 text-amber-950 font-bold text-xs">
                      {banner.badge}
                    </Badge>
                  )}
                </div>

                {/* Position & Status Top Right */}
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-white">
                  <span>Pos #{banner.position}</span>
                  <span className="opacity-40">•</span>
                  <span className="flex items-center gap-1">
                    {banner.is_active ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Hidden
                      </span>
                    )}
                  </span>
                </div>

                {/* Title & Subtitle overlaid on image */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-bold leading-tight drop-shadow-sm">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{banner.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Banner Details & Links Configuration */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Click target destination */}
                  <div className="flex items-center justify-between text-xs bg-muted/60 p-2.5 rounded-lg">
                    <span className="text-muted-foreground font-medium">Banner Click Link:</span>
                    <Link
                      href={banner.link_url}
                      target="_blank"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-mono font-semibold truncate max-w-[200px]"
                    >
                      {banner.link_url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </Link>
                  </div>

                  {/* CTA Button configuration */}
                  <div className="flex items-center justify-between text-xs bg-muted/60 p-2.5 rounded-lg">
                    <span className="text-muted-foreground font-medium">Action Button (CTA):</span>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded text-[11px]">
                        "{banner.cta_text}"
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-muted-foreground font-medium truncate max-w-[140px]">
                        {banner.cta_link}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Control Actions Row */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={() => handleToggleActive(banner)}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {banner.is_active ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(banner)}
                      className="h-8 px-3 text-xs flex items-center gap-1.5"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(banner.id)}
                      className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Banner Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-600" />
              {editingBannerId ? "Edit Banner & Destinations" : "Create New Storefront Banner"}
            </DialogTitle>
            <DialogDescription>
              Configure image visuals, title text, on-click navigation, and CTA button destinations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Banner Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setFormData({ ...formData, type: "hero" })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.type === "hero"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-foreground">Hero Carousel Slider</span>
                  <Badge variant={formData.type === "hero" ? "default" : "outline"} className="text-[10px]">
                    Main Top
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Displays in the large interactive slider at the top of the home page.
                </p>
              </div>

              <div
                onClick={() => setFormData({ ...formData, type: "promo" })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.type === "promo"
                    ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-foreground">Promo Banner Card</span>
                  <Badge variant={formData.type === "promo" ? "default" : "outline"} className="text-[10px]">
                    Grid Card
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Displays in the 4-column promotional cards grid on the home page.
                </p>
              </div>
            </div>

            {/* Title & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Banner Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Apple iPhone 16 Pro Max"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="badge" className="text-xs font-semibold">
                  Badge Label (Optional)
                </Label>
                <Input
                  id="badge"
                  placeholder="e.g. Flash Deal, New"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <Label htmlFor="subtitle" className="text-xs font-semibold">
                Subtitle / Description
              </Label>
              <Input
                id="subtitle"
                placeholder="e.g. Experience next-generation performance with A18 Pro chip"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="image_url" className="text-xs font-semibold">
                Image URL *
              </Label>
              <Input
                id="image_url"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                required
              />
              {formData.image_url && (
                <div className="relative h-28 w-full rounded-lg overflow-hidden border border-border mt-2 bg-slate-900">
                  <Image
                    src={formData.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold">
                    Visual Preview
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Destinations */}
            <div className="bg-muted/40 p-4 rounded-xl space-y-4 border border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Click & CTA Button Actions
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="link_url" className="text-xs font-semibold">
                  Banner On-Click Destination URL *
                </Label>
                <Input
                  id="link_url"
                  placeholder="/product?category=1 or /product/1"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Where the user goes when clicking directly on the banner image card.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cta_text" className="text-xs font-semibold">
                    CTA Button Label *
                  </Label>
                  <Input
                    id="cta_text"
                    placeholder="e.g. Shop Now, Explore"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cta_link" className="text-xs font-semibold">
                    CTA Button Destination URL *
                  </Label>
                  <Input
                    id="cta_link"
                    placeholder="/product?category=1"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Position & Active Switch */}
            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="position" className="text-xs font-semibold">
                  Display Order / Position (0 = First)
                </Label>
                <Input
                  id="position"
                  type="number"
                  min={0}
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(val) => setFormData({ ...formData, is_active: val })}
                />
                <Label htmlFor="is_active" className="text-xs font-semibold cursor-pointer">
                  Activate on storefront immediately
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={submitting}
              >
                {submitting ? "Saving..." : editingBannerId ? "Save Changes" : "Create Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Banner
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this banner? It will immediately disappear from the storefront.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
