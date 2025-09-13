"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Tag } from "lucide-react";

interface PassManagerProps {
  eventId: Id<"events">;
}

export default function PassManager({ eventId }: PassManagerProps) {
  const passes = useQuery(api.passes.getEventPasses, { eventId });
  const createPass = useMutation(api.passes.createPass);
  const updatePass = useMutation(api.passes.updatePass);
  const deletePass = useMutation(api.passes.deletePass);

  const [showForm, setShowForm] = useState(false);
  const [editingPass, setEditingPass] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    totalQuantity: 1,
    benefits: [""],
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const benefits = formData.benefits.filter(b => b.trim() !== "");
    
    if (editingPass) {
      await updatePass({
        passId: editingPass._id,
        ...formData,
        benefits,
      });
    } else {
      await createPass({
        eventId,
        ...formData,
        benefits,
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      totalQuantity: 1,
      benefits: [""],
      category: "",
    });
    setShowForm(false);
    setEditingPass(null);
  };

  const handleEdit = (pass: any) => {
    setFormData({
      name: pass.name,
      description: pass.description,
      price: pass.price,
      totalQuantity: pass.totalQuantity,
      benefits: pass.benefits.length > 0 ? pass.benefits : [""],
      category: pass.category || "",
    });
    setEditingPass(pass);
    setShowForm(true);
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, ""]
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => i === index ? value : b)
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  if (!passes) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Event Passes</h3>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Pass
        </Button>
      </div>

      {/* Pass List */}
      <div className="grid gap-4">
        {passes.map((pass) => (
          <div key={pass._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold">{pass.name}</h4>
                  {pass.category && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {pass.category}
                    </span>
                  )}
                  <span className="text-lg font-bold text-green-600">£{pass.price}</span>
                </div>
                <p className="text-gray-600 mb-2">{pass.description}</p>
                <div className="text-sm text-gray-500 mb-2">
                  {pass.soldQuantity}/{pass.totalQuantity} sold
                </div>
                {pass.benefits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Benefits:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {pass.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(pass)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deletePass({ passId: pass._id })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pass Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingPass ? "Edit Pass" : "Create New Pass"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pass Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., VIP Pass, General Admission"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this pass includes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price (£)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Total Quantity</label>
                <Input
                  type="number"
                  value={formData.totalQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalQuantity: Number(e.target.value) }))}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="VIP">VIP</option>
                  <option value="Seasonal Pass">Seasonal Pass</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Benefits</label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Enter benefit"
                    />
                    {formData.benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBenefit}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Benefit
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingPass ? "Update Pass" : "Create Pass"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}