import React, { useState, useEffect } from "react";
import apiClient from "../src/services/apiClient";
import toast from "react-hot-toast";
import { useAuth } from "../src/hooks/useAuth";

interface CarouselSlide {
  _id: string;
  image: { url: string; public_id: string };
  tagline: string;
  order: number;
}

const AdminCarouselManager: React.FC = () => {
  const { admin } = useAuth();
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [tagline, setTagline] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [order, setOrder] = useState<number>(0);

  const fetchSlides = async () => {
    try {
      const response = await apiClient.get("/carousel");
      setSlides((response as any).data || response);
    } catch (err) {
      console.error("Failed syncing slider matrix components:", err);
    }
  };

  useEffect(() => {
    if (admin && admin.role === "super_admin") {
      fetchSlides();
    }
  }, [admin]);

  if (!admin || admin.role !== "super_admin") {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center mt-12 bg-neutral-50 border border-gray-200">
        <h2 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-2">
          Access Denied
        </h2>
        <p className="text-xs text-gray-500 font-light">
          You do not possess the required validation clearance properties to
          access this directory sector.
        </p>
      </div>
    );
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || order === null || order === undefined)
      return toast.error("Image file and order are required.");

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("tagline", tagline); // Sends an empty string if nothing is typed
    formData.append("order", order.toString());

    try {
      await apiClient.post("/carousel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Slide appended to layout array!");
      setTagline("");
      setFile(null);
      (document.getElementById("fileInputWrapper") as HTMLInputElement).value =
        "";
      fetchSlides();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Access Denied: Admin confirmation validation failed."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this slide from your homepage and Cloudinary?"))
      return;
    try {
      await apiClient.delete(`/carousel/${id}`);
      toast.success("Slide tracking purged.");
      setSlides((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      toast.error("Failed purging media configuration context data metrics.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border border-gray-100 shadow-sm mt-12">
      <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6">
        Hero Carousel Manager (Admin Only)
      </h2>

      <form
        onSubmit={handleUploadSubmit}
        className="space-y-4 border-b border-gray-100 pb-8 mb-8"
      >
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Select Image Asset
          </label>
          <input
            id="fileInputWrapper"
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="text-xs file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:text-xs file:uppercase file:tracking-wider hover:file:bg-neutral-800 cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Tagline Text Overlay
          </label>
          <input
            type="text"
            placeholder="e.g., Crafting Timeless Architecture"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-black rounded-xs"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Display Priority Order
          </label>
          <select
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-full border border-gray-200 p-2 text-sm bg-white focus:outline-none focus:border-black rounded-xs"
          >
            <option value={0}>0 (Default - First/Unsorted)</option>
            <option value={1}>1 (Position Two)</option>
            <option value={2}>2 (Position Three)</option>
            <option value={3}>3 (Position Four)</option>
            <option value={4}>4 (Position Five)</option>
            <option value={5}>5 (Position Six)</option>
            <option value={6}>6 (Position Seven)</option>
            <option value={7}>7 (Position Eight)</option>
            <option value={8}>8 (Position Nine)</option>
            <option value={9}>9 (Position Ten)</option>
            <option value={10}>10 (Position Eleven)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-black text-white text-[10px] uppercase font-bold tracking-widest py-2.5 px-6 hover:bg-neutral-900 transition disabled:opacity-40"
        >
          {uploading ? "Uploading Asset Matrix..." : "Commit New Slide"}
        </button>
      </form>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4">
          Active Layout Viewport Index
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {slides.map((slide) => (
            <div
              key={slide._id}
              className="border border-gray-100 p-3 bg-neutral-50 flex flex-col justify-between"
            >
              {/* Slide Thumbnail Preview */}
              <img
                src={slide.image.url}
                alt="Admin thumbnail overview map"
                className="w-full h-32 object-cover mb-2"
              />

              {/* Asset Details Strip */}
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs truncate max-w-[200px] italic text-gray-600">
                    {slide.tagline ? (
                      `"${slide.tagline}"`
                    ) : (
                      <span className="text-gray-400">(No tagline)</span>
                    )}
                  </span>

                  {/* ✅ Priority Order Badge */}
                  <span className="bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs tracking-tight">
                    POS: {slide.order}
                  </span>
                </div>

                <div className="flex justify-end pt-1 border-t border-neutral-200/60">
                  <button
                    type="button"
                    onClick={() => handleDelete(slide._id)}
                    className="text-[10px] uppercase tracking-wider text-red-600 font-bold hover:text-red-800 transition-colors"
                  >
                    Delete Slide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCarouselManager;
