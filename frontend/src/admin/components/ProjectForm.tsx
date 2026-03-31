import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { UploadCloud, X } from "lucide-react";

import { Project, ProjectPhoto, UploadableFile } from "../types";
import {
  createProject,
  updateProject,
} from "../../services/projectAdminService";
import { uploadToCloudinary } from "../../services/cloudinaryService";
import { validateProjectForm } from "../../utils/validation";

import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { SortableImagePreview } from "./ImagePreviewGrid";

interface ProjectFormProps {
  project?: Project;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project }) => {
  const navigate = useNavigate();
  const isEditMode = !!project;

  const [formData, setFormData] = useState({
    projectName: "",
    category: "home" as any,
    sqft: "",
    location: "",
    description: "",
  });

  const [mainPhoto, setMainPhoto] = useState<UploadableFile | null>(null);
  const [existingMainPhoto, setExistingMainPhoto] = useState<{
    url: string;
    public_id: string;
  } | null>(null);

  const [descriptionPhotos, setDescriptionPhotos] = useState<UploadableFile[]>(
    []
  );
  const [existingDescPhotos, setExistingDescPhotos] = useState<ProjectPhoto[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && project) {
      setFormData({
        projectName: project.projectName,
        category: project.category,
        sqft: project.sqft || "",
        location: project.location,
        description: project.description,
      });
      setExistingMainPhoto(project.mainPhoto);
      setExistingDescPhotos(project.descriptionPhotos);
    }
  }, [project, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onDropMain = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const file = acceptedFiles[0];
      setMainPhoto({
        file,
        preview: URL.createObjectURL(file),
        caption: "",
        id: Date.now().toString(),
      });
      setExistingMainPhoto(null);
    }
  }, []);

  const { getRootProps: getMainRootProps, getInputProps: getMainInputProps } =
    useDropzone({
      onDrop: onDropMain,
      accept: { "image/*": [] },
      maxFiles: 1,
    });

  const onDropDesc = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      id: file.name + Date.now(),
    }));
    setDescriptionPhotos((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps: getDescRootProps, getInputProps: getDescInputProps } =
    useDropzone({
      onDrop: onDropDesc,
      accept: { "image/*": [] },
    });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeId = String(active.id);
      const overId = String(over.id);
      if (descriptionPhotos.some((p) => p.id === activeId)) {
        const oldIdx = descriptionPhotos.findIndex((p) => p.id === activeId);
        const newIdx = descriptionPhotos.findIndex((p) => p.id === overId);
        setDescriptionPhotos((items) => arrayMove(items, oldIdx, newIdx));
      } else {
        const oldIdx = existingDescPhotos.findIndex((p) => p.url === activeId);
        const newIdx = existingDescPhotos.findIndex((p) => p.url === overId);
        setExistingDescPhotos((items) => arrayMove(items, oldIdx, newIdx));
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateProjectForm(formData, mainPhoto, descriptionPhotos);
    if (error) return toast.error(error);

    setIsLoading(true);
    try {
      // 1. Upload Main Photo (if changed)
      let finalMainPhoto = existingMainPhoto;
      if (mainPhoto) {
        finalMainPhoto = await uploadToCloudinary(mainPhoto.file);
      }

      if (!finalMainPhoto) throw new Error("Main photo is required");

      // 2. Upload New Gallery Photos
      const newUploads = [];
      for (const p of descriptionPhotos) {
        const res = await uploadToCloudinary(p.file);
        newUploads.push({ ...res, caption: p.caption });
      }

      // 3. Final Payload (JSON only)
      // 3. Final Payload (JSON only)
      // Adding the type ': Partial<Project>' here stops the red lines
      const payload: Partial<Project> = {
        projectName: formData.projectName,
        category: formData.category as any, // 'as any' fixes the strict category string check
        sqft: formData.sqft,
        location: formData.location,
        description: formData.description,
        mainPhoto: finalMainPhoto as { url: string; public_id: string },
        descriptionPhotos: [...existingDescPhotos, ...newUploads],
      };

      if (isEditMode && project) {
        await updateProject(project._id, payload);
        toast.success("Updated successfully!");
      } else {
        await createProject(payload);
        toast.success("Created successfully!");
      }
      navigate("/admin/projects");
    } catch (err: any) {
      toast.error(err.message || "Saving failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Project Name"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={[
                    { value: "home", label: "Residential" },
                    { value: "commercial", label: "Commercial" },
                    { value: "hospitality", label: "Hospitality" },
                    { value: "interiors", label: "Interiors" },
                  ]}
                  required
                />
                <Input
                  label="Square Feet"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                />
              </div>
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getDescRootProps()}
                className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-black transition-colors"
              >
                <input {...getDescInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p>Upload Gallery Images (Max 8MB each)</p>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={[
                    ...existingDescPhotos.map((p) => p.url),
                    ...descriptionPhotos.map((p) => p.id),
                  ]}
                  strategy={rectSortingStrategy}
                >
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {existingDescPhotos.map((p) => (
                      <SortableImagePreview
                        key={p.url}
                        id={p.url}
                        photo={{ ...p, preview: p.url, isExisting: true }}
                        onRemove={(url) =>
                          setExistingDescPhotos((prev) =>
                            prev.filter((x) => x.url !== url)
                          )
                        }
                        onCaptionUpdate={(id, cap) =>
                          setExistingDescPhotos((prev) =>
                            prev.map((x) =>
                              x.url === id ? { ...x, caption: cap } : x
                            )
                          )
                        }
                      />
                    ))}
                    {descriptionPhotos.map((p) => (
                      <SortableImagePreview
                        key={p.id}
                        id={p.id}
                        photo={{ ...p, isExisting: false }}
                        onRemove={(id) =>
                          setDescriptionPhotos((prev) =>
                            prev.filter((x) => x.id !== id)
                          )
                        }
                        onCaptionUpdate={(id, cap) =>
                          setDescriptionPhotos((prev) =>
                            prev.map((x) =>
                              x.id === id ? { ...x, caption: cap } : x
                            )
                          )
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Main Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getMainRootProps()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
              >
                <input {...getMainInputProps()} />
                <p>Click to change Main Photo</p>
              </div>
              {(mainPhoto || existingMainPhoto) && (
                <div className="mt-4 relative">
                  <img
                    src={mainPhoto?.preview || existingMainPhoto?.url}
                    className="w-full h-auto rounded-lg"
                    alt="Preview"
                  />
                </div>
              )}
            </CardContent>
          </Card>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Save Project"}
          </Button>
        </div>
      </div>
    </form>
  );
};
