import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, KeyRound, Loader2, ShieldCheck, X, Eye, Link as LinkIcon, Unlink } from "lucide-react";
import api from "@/api/axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Actions Modal State
  const [editUser, setEditUser] = useState(null);
  const [resetPassUser, setResetPassUser] = useState(null);
  const [resettingPass, setResettingPass] = useState(false); // New loading state for resetting
  
  // View Individual Expenses State
  const [viewExpensesUser, setViewExpensesUser] = useState(null);
  const [userExpenses, setUserExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/getUsers.php");
      if (res.data.success) setUsers(res.data.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will delete all data associated with this user!")) return;
    try {
      const res = await api.post("/admin/deleteUser.php", { id });
      if(res.data.success) fetchUsers();
      else alert(res.data.message);
    } catch (error) { console.error(error); }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/updateUser.php", editUser);
      if(res.data.success) {
          setEditUser(null);
          fetchUsers();
      } else alert(res.data.message);
    } catch (error) { console.error(error); }
  };

  // --- UPDATED: No longer sends a manual password. Just the user ID. ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResettingPass(true);
    try {
      const res = await api.post("/admin/resetPassword.php", { id: resetPassUser.id });
      if(res.data.success) {
          setResetPassUser(null);
          alert("Success! A new random password has been emailed to the user.");
      } else alert(res.data.message);
    } catch (error) { 
        console.error(error); 
        alert("An error occurred while resetting the password.");
    } finally {
        setResettingPass(false);
    }
  };

  const openExpensesModal = async (user) => {
    setViewExpensesUser(user);
    setExpensesLoading(true);
    try {
        const res = await api.get(`/admin/getUserExpenses.php?user_id=${user.id}`);
        if(res.data.success) setUserExpenses(res.data.data);
    } catch (e) { console.error(e); }
    finally { setExpensesLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="text-muted-foreground">Admin panel to manage system users and monitor activity.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gray-800" /> Registered Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-800" /></div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Linked Parent</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'parent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.role === 'student' ? (
                             u.parent_name ? (
                               <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                                 <LinkIcon size={14} className="text-green-500" />
                                 {u.parent_name}
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 text-gray-400 italic text-xs">
                                 <Unlink size={14} /> Unlinked
                               </div>
                             )
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openExpensesModal(u)} title="View Expenses">
                              <Eye className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditUser(u)} title="Edit Info">
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setResetPassUser(u)} title="Reset Password">
                              <KeyRound className="h-4 w-4 text-orange-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} title="Delete User">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* MODAL: Edit User */}
        {editUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditUser(null)} />
            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 z-50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Edit User</h2>
                <button onClick={() => setEditUser(null)}><X size={20}/></button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div><Label>First Name</Label><Input value={editUser.first_name} onChange={e => setEditUser({...editUser, first_name: e.target.value})} required/></div>
                <div><Label>Last Name</Label><Input value={editUser.last_name} onChange={e => setEditUser({...editUser, last_name: e.target.value})} required/></div>
                <div><Label>Email</Label><Input type="email" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} required/></div>
                <div>
                  <Label>Role</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})}>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-gray-900 hover:bg-black text-white">Save Changes</Button>
              </form>
            </div>
          </div>
        )}

        {/* --- UPDATED MODAL: Reset Password (Auto Generate) --- */}
        {resetPassUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setResetPassUser(null)} />
            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 z-50">
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Auto-Reset Password</h2>
                <button onClick={() => setResetPassUser(null)}><X size={20}/></button>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to reset the password for <b>{resetPassUser.email}</b>?
              </p>

              <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg mb-6">
                 <p className="text-xs text-orange-800 font-medium">
                    A secure, random 10-character password will be generated and emailed directly to the user.
                 </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={resettingPass}>
                    {resettingPass ? <Loader2 className="animate-spin mr-2" /> : <KeyRound size={16} className="mr-2" />}
                    Generate & Email Password
                </Button>
              </form>

            </div>
          </div>
        )}

        {/* MODAL: View Individual User Expenses */}
        {viewExpensesUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewExpensesUser(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 z-50 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{viewExpensesUser.first_name}'s Expenses</h2>
                    <p className="text-sm text-gray-500">{viewExpensesUser.email}</p>
                </div>
                <button onClick={() => setViewExpensesUser(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><X size={20}/></button>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {expensesLoading ? (
                      <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
                  ) : userExpenses.length === 0 ? (
                      <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        This user has no recorded expenses.
                      </div>
                  ) : (
                      <table className="w-full text-sm text-left border">
                        <thead className="bg-gray-50 text-gray-600 sticky top-0 border-b">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Date</th>
                                <th className="px-4 py-3 font-semibold">Category</th>
                                <th className="px-4 py-3 font-semibold">Description</th>
                                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {userExpenses.map(txn => (
                                <tr key={txn.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{txn.date}</td>
                                    <td className="px-4 py-3 font-bold text-gray-900">{txn.category_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{txn.description || '-'}</td>
                                    <td className="px-4 py-3 text-right font-bold text-red-600 whitespace-nowrap">NPR {parseFloat(txn.amount).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                      </table>
                  )}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}