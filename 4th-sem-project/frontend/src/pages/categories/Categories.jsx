import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, Save, X, Plus, Lock, Layers, Loader2, Check } from "lucide-react";
import api from "@/api/axios";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Main Category States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit States
  const [editCatId, setEditCatId] = useState(null);
  const [editCatName, setEditCatName] = useState("");
  const [editSubId, setEditSubId] = useState(null);
  const [editSubName, setEditSubName] = useState("");

  const [addingSubToId, setAddingSubToId] = useState(null);
  const [newSubNameInput, setNewSubNameInput] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category/getCategories.php");
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddLoading(true);
    try {
        const res = await api.post("/category/addCategory.php", { name: newCatName });
        
        if (res.data.success) {
            setNewCatName("");
            setIsAddOpen(false);
            fetchCategories(); 
        } else {
            // POP UP ERROR for Category
            alert(res.data.message);
        }
    } catch (error) {
        console.error("Failed to add", error);
        alert("Server error occurred");
    } finally {
        setAddLoading(false);
    }
  };

  const handleAddSubSubmit = async (categoryId) => {
    if (!newSubNameInput.trim()) return;
    try {
        const res = await api.post("/category/addSubCategory.php", {
            category_id: categoryId,
            name: newSubNameInput
        });

        if (res.data.success) {
            setAddingSubToId(null);
            setNewSubNameInput("");
            fetchCategories();
        } else {
            // POP UP ERROR for Sub-Category
            alert(res.data.message);
        }
    } catch (error) {
        console.error("Failed to add sub-category", error);
        alert("Server error occurred");
    }
  };

  const startEditCategory = (cat) => {
    setEditCatId(cat.id);
    setEditCatName(cat.category_name);
  };

  const saveCategory = async (id) => {
    try {
      await api.post("/category/updateCategory.php", { id, name: editCatName });
      setEditCatId(null);
      fetchCategories();
    } catch (e) { console.error(e); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category? All sub-categories inside it will be deleted.")) return;
    try {
      await api.post("/category/deleteCategory.php", { id });
      fetchCategories();
    } catch (e) { console.error(e); }
  };

  const startEditSub = (sub) => {
    setEditSubId(sub.id);
    setEditSubName(sub.name);
  };

  const saveSub = async (id) => {
    try {
      await api.post("/category/updateSubCategory.php", { id, name: editSubName });
      setEditSubId(null);
      fetchCategories();
    } catch (e) { console.error(e); }
  };

  const deleteSub = async (id) => {
    if (!window.confirm("Delete this sub-category?")) return;
    try {
      await api.post("/category/deleteSubCategory.php", { id });
      fetchCategories();
    } catch (e) { console.error(e); }
  };

  const isEditable = (item) => {
    return item.user_id !== null && item.user_id !== undefined;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Categories</h1>
                <p className="text-muted-foreground mt-1">
                    <Lock className="inline h-3 w-3 mr-1" /> System categories are locked, but you can add sub-categories to them.
                </p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
        </div>

        {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <Card key={cat.id} className="relative overflow-hidden border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-3">
                            <div className="flex items-center justify-between">
                                {editCatId === cat.id ? (
                                    <div className="flex gap-2 w-full">
                                        <Input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="h-8" />
                                        <Button size="icon" className="h-8 w-8 bg-green-600" onClick={() => saveCategory(cat.id)}><Save size={14}/></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditCatId(null)}><X size={14}/></Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 font-bold text-gray-800">
                                        <Layers className="h-4 w-4 text-blue-500" />
                                        {cat.category_name}
                                    </div>
                                )}

                                <div className="flex gap-1">
                                    {isEditable(cat) ? (
                                        <>
                                            {!editCatId && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => startEditCategory(cat)}>
                                                        <Pencil size={14} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => deleteCategory(cat.id)}>
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <Lock size={14} className="text-gray-400" title="System Category" />
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-4 bg-white flex-1 flex flex-col">
                            <div className="space-y-2 mb-4">
                                {cat.sub_categories && cat.sub_categories.length > 0 ? (
                                    cat.sub_categories.map((sub) => (
                                        <div key={sub.id} className="flex items-center justify-between group p-2 rounded hover:bg-gray-50 transition-colors">
                                            {editSubId === sub.id ? (
                                                <div className="flex gap-2 w-full">
                                                    <Input value={editSubName} onChange={(e) => setEditSubName(e.target.value)} className="h-7 text-xs" />
                                                    <Button size="icon" className="h-7 w-7 bg-green-600" onClick={() => saveSub(sub.id)}><Save size={12}/></Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditSubId(null)}><X size={12}/></Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                                    {sub.name}
                                                </div>
                                            )}

                                            {isEditable(sub) && !editSubId && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEditSub(sub)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Pencil size={12}/></button>
                                                    <button onClick={() => deleteSub(sub.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={12}/></button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic pl-4">No sub-categories</p>
                                )}
                            </div>

                            <div className="mt-auto pt-2 border-t border-gray-100">
                                {addingSubToId === cat.id ? (
                                    <div className="flex gap-2 items-center animate-in fade-in zoom-in-95 duration-200">
                                        <Input 
                                            value={newSubNameInput}
                                            onChange={(e) => setNewSubNameInput(e.target.value)}
                                            placeholder="Sub name..."
                                            className="h-8 text-sm"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubSubmit(cat.id)}
                                        />
                                        <Button size="icon" className="h-8 w-8 bg-green-600 shrink-0" onClick={() => handleAddSubSubmit(cat.id)}>
                                            <Check size={14} />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-gray-500" onClick={() => { setAddingSubToId(null); setNewSubNameInput(""); }}>
                                            <X size={14} />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-dashed border-gray-200 hover:border-blue-200"
                                        onClick={() => { setAddingSubToId(cat.id); setNewSubNameInput(""); }}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Add Sub-category
                                    </Button>
                                )}
                            </div>

                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

        {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
                <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 z-50 animate-in fade-in zoom-in-95">
                    <h2 className="text-lg font-bold mb-4">Create Custom Category</h2>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input 
                                value={newCatName} 
                                onChange={(e) => setNewCatName(e.target.value)} 
                                placeholder="e.g. Pets, Projects..." 
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={addLoading}>
                                {addLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Create"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    </DashboardLayout>
  );
}