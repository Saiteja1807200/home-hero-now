import { useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface AddressForm {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

const emptyForm: AddressForm = { label: "Home", street: "", city: "", state: "", pincode: "" };

export default function SavedAddresses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["my-addresses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (addr: any) => {
    setEditingId(addr.id);
    setForm({ label: addr.label, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !form.street || !form.city || !form.state || !form.pincode) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from("addresses").update(form).eq("id", editingId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Address updated" });
    } else {
      const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Address added" });
    }
    qc.invalidateQueries({ queryKey: ["my-addresses"] });
    setDialogOpen(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("addresses").delete().eq("id", deleteId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Address deleted" });
    qc.invalidateQueries({ queryKey: ["my-addresses"] });
    setDeleteId(null);
  };

  const setField = (key: keyof AddressForm, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={() => navigate("/profile")} className="touch-target">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-lg font-bold flex-1">Saved Addresses</h1>
        <Button size="sm" onClick={openAdd}><Plus size={16} /> Add</Button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {isLoading && [1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        {!isLoading && addresses?.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No saved addresses yet.</p>
        )}
        {addresses?.map((addr) => (
          <div key={addr.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-foreground">{addr.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{addr.street}, {addr.city}, {addr.state} – {addr.pincode}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(addr)} className="text-muted-foreground hover:text-foreground"><Pencil size={16} /></button>
                <button onClick={() => setDeleteId(addr.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Address" : "Add Address"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Label</Label>
              <Input value={form.label} onChange={(e) => setField("label", e.target.value)} placeholder="Home, Work…" />
            </div>
            <div className="space-y-1">
              <Label>Street</Label>
              <Input value={form.street} onChange={(e) => setField("street", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setField("city", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setField("state", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Pincode</Label>
              <Input value={form.pincode} onChange={(e) => setField("pincode", e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving…" : editingId ? "Update" : "Add Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete address?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
