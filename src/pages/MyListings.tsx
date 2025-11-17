import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import PayoutStatusBanner from "@/components/PayoutStatusBanner";
import { Loader2, Trash, Edit, PlusCircle } from "lucide-react";

interface ListingForm {
  type: "service" | "tool";
  name: string;
  description: string;
  category: string;
  tags: string;
  pricingModel: "subscription" | "fixed" | "hourly";
  price?: string;
  priceRange?: "low" | "mid" | "high";
  websiteUrl?: string;
}

interface Listing extends ListingForm {
  _id: string;
  ownerType: string;
  createdAt: string;
}

const defaultForm: ListingForm = {
  type: "service",
  name: "",
  description: "",
  category: "",
  tags: "",
  pricingModel: "fixed",
  price: "",
  priceRange: "mid",
  websiteUrl: "",
};

const MyListings = () => {
  const { toast } = useToast();
  const user = ApiService.getUser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ListingForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ListingForm>(defaultForm);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadListings();
    loadProfile();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMyListings();
      setListings(response.items || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to load listings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await ApiService.getProfile();
      setProfile(response.user || null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to load profile", variant: "destructive" });
    }
  };

  const formatPayload = (payload: ListingForm) => ({
    ...payload,
    tags: payload.tags ? payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    price: payload.price ? Number(payload.price) : undefined,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiService.createMarketplaceItem(formatPayload(form));
      toast({ title: "Listing created", description: "Your offering is now visible in the marketplace." });
      setForm(defaultForm);
      loadListings();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to create listing", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (listing: Listing) => {
    setEditingId(listing._id);
    setEditForm({
      type: listing.type,
      name: listing.name,
      description: listing.description,
      category: listing.category,
      tags: (listing.tags || []).join(", "),
      pricingModel: listing.pricingModel,
      price: listing.price ? String(listing.price) : "",
      priceRange: listing.priceRange || "mid",
      websiteUrl: listing.websiteUrl || "",
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setSubmitting(true);
    try {
      await ApiService.updateMarketplaceItem(editingId, formatPayload(editForm));
      toast({ title: "Listing updated" });
      setEditingId(null);
      loadListings();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to update listing", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this listing?")) return;
    try {
      await ApiService.deleteMarketplaceItem(id);
      toast({ title: "Listing removed" });
      setListings((prev) => prev.filter((listing) => listing._id !== id));
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to delete listing", variant: "destructive" });
    }
  };

  const renderFormFields = (state: ListingForm, setState: (value: ListingForm) => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Listing Type</label>
          <Select value={state.type} onValueChange={(value: ListingForm["type"]) => setState({ ...state, type: value })}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-semibold">Category</label>
          <Input
            className="mt-2"
            value={state.category}
            onChange={(e) => setState({ ...state, category: e.target.value })}
            placeholder="Automation, CRM, etc"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold">Name</label>
        <Input className="mt-2" value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} />
      </div>
      <div>
        <label className="text-sm font-semibold">Description</label>
        <Textarea
          className="mt-2"
          value={state.description}
          onChange={(e) => setState({ ...state, description: e.target.value })}
          placeholder="Describe the deliverable or tool"
        />
      </div>
      <div>
        <label className="text-sm font-semibold">Tags</label>
        <Input
          className="mt-2"
          value={state.tags}
          onChange={(e) => setState({ ...state, tags: e.target.value })}
          placeholder="automation, ai, crm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-semibold">Pricing Model</label>
          <Select
            value={state.pricingModel}
            onValueChange={(value: ListingForm["pricingModel"]) => setState({ ...state, pricingModel: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-semibold">Price</label>
          <Input
            type="number"
            className="mt-2"
            value={state.price || ""}
            onChange={(e) => setState({ ...state, price: e.target.value })}
            placeholder="500"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Price Range</label>
          <Select
            value={state.priceRange}
            onValueChange={(value: ListingForm["priceRange"]) => setState({ ...state, priceRange: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="mid">Mid</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold">Website / Demo URL</label>
        <Input
          className="mt-2"
          value={state.websiteUrl || ""}
          onChange={(e) => setState({ ...state, websiteUrl: e.target.value })}
          placeholder="https://example.com"
        />
      </div>
    </div>
  );

  const payoutProfile =
    user?.userType === "freelancer"
      ? profile?.freelancerProfile
      : user?.userType === "service_provider"
      ? profile?.serviceProviderProfile
      : null;
  const showPayoutWarning =
    (user?.userType === "freelancer" || user?.userType === "service_provider") && !payoutProfile?.payoutsEnabled;

  if (!user || (user.userType !== "freelancer" && user.userType !== "service_provider")) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-20 px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <p className="text-muted-foreground">
              Only freelancer or service provider accounts can publish marketplace listings.
            </p>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Marketplace Listings</h1>
            <p className="text-muted-foreground">
              Launch offerings, update pricing, and showcase your services to IMPEARL businesses.
            </p>
          </div>

          <PayoutStatusBanner
            initialStatus={{
              payoutsEnabled: payoutProfile?.payoutsEnabled,
              stripeStatus: payoutProfile?.stripeStatus,
            }}
          />

          {showPayoutWarning && (
            <Card className="p-4 border-amber-200 bg-amber-50 text-amber-900">
              <p className="text-sm">
                Complete Stripe payout setup so buyers can see and purchase your listings. You can still draft offerings
                while onboarding is in progress.
              </p>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Create new listing</h2>
            </div>
            <form className="space-y-6" onSubmit={handleCreate}>
              {renderFormFields(form, setForm)}
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </form>
          </Card>


          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Existing listings</h2>
              <Badge variant="secondary">{listings.length}</Badge>
            </div>
            {loading ? (
              <Card className="p-6 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading your offerings...</p>
              </Card>
            ) : listings.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No listings yet. Publish your first service above.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <Card key={listing._id} className="p-6 space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{listing.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{listing.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{listing.type}</Badge>
                          {listing.category && <Badge variant="outline">{listing.category}</Badge>}
                          <Badge variant="secondary">{listing.pricingModel}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEditing(listing)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(listing._id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-semibold text-foreground">Pricing</p>
                        <p>{listing.price ? `$${listing.price}` : "Contact for pricing"}</p>
                        <p className="text-xs uppercase tracking-wide mt-1">Range: {listing.priceRange || "mid"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Tags</p>
                        <p>{Array.isArray(listing.tags) ? listing.tags.join(", ") : listing.tags}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Website</p>
                        {listing.websiteUrl ? (
                          <a
                            href={listing.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            {listing.websiteUrl}
                          </a>
                        ) : (
                          <span>Not provided</span>
                        )}
                      </div>
                    </div>

                    {editingId === listing._id && (
                      <div className="border-t border-border pt-4 space-y-4">
                        <h4 className="font-semibold text-foreground">Edit listing</h4>
                        {renderFormFields(editForm, setEditForm)}
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdate} disabled={submitting}>
                            {submitting ? "Saving..." : "Save changes"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyListings;
