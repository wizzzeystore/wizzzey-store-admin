"use client";
import React, { useEffect, useState, useRef } from "react";

interface SizeChart {
  _id: string;
  title: string;
  description?: string;
  image: string;
}

export default function SizeChartsPage() {
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSizeCharts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/size-charts", { credentials: "include" });
      const data = await res.json();
      setSizeCharts(data.data.sizeCharts || []);
    } catch (err) {
      setError("Failed to fetch size charts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizeCharts();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image) return setError("Title and image are required");
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", image);
      if (description) formData.append("description", description);
      const res = await fetch("/api/size-charts", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to upload");
      setTitle("");
      setDescription("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchSizeCharts();
    } catch (err) {
      setError("Failed to upload size chart");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this size chart?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/size-charts/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchSizeCharts();
    } catch (err) {
      setError("Failed to delete size chart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Size Charts</h1>
      <form onSubmit={handleUpload} className="mb-6 flex flex-col gap-2 bg-white p-4 rounded shadow">
        <label className="font-semibold">Title *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="border p-2 rounded" required />
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded" />
        <label className="font-semibold">Image *</label>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImage(e.target.files?.[0] || null)} required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2" disabled={loading}>Upload</button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid gap-4">
        {loading && <div>Loading...</div>}
        {sizeCharts.map(chart => (
          <div key={chart._id} className="flex items-center gap-4 bg-gray-50 p-4 rounded shadow">
            <img src={chart.image} alt={chart.title} className="w-24 h-24 object-contain border rounded" />
            <div className="flex-1">
              <div className="font-semibold">{chart.title}</div>
              {chart.description && <div className="text-gray-600 text-sm">{chart.description}</div>}
            </div>
            <button onClick={() => handleDelete(chart._id)} className="text-red-600 hover:underline">Delete</button>
          </div>
        ))}
        {sizeCharts.length === 0 && !loading && <div>No size charts uploaded yet.</div>}
      </div>
    </div>
  );
} 