import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import { Project, ProjectPhoto, UploadableFile } from '../types';
import { createProject, updateProject } from '../../services/projectAdminService';

import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { UploadCloud, X } from 'lucide-react';
import { SortableImagePreview } from './ImagePreviewGrid';

interface ProjectFormProps {
  project?: Project;
}

const categoryOptions = [
  { value: 'home', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'interiors', label: 'Interiors' },
];

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds 4MB limit. Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }
  return { valid: true };
};

export const ProjectForm: React.FC<ProjectFormProps> = ({ project }) => {
  const navigate = useNavigate();
  const isEditMode = !!project;

  const [formData, setFormData] = useState({
    projectName: '',
    category: 'home',
    sqft: '',
    location: '',
    description: '',
  });

  const [mainPhoto, setMainPhoto] = useState<UploadableFile | null>(null);
  const [existingMainPhotoUrl, setExistingMainPhotoUrl] = useState<string | null>(null);

  const [descriptionPhotos, setDescriptionPhotos] = useState<UploadableFile[]>([]);
  const [existingDescPhotos, setExistingDescPhotos] = useState<ProjectPhoto[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && project) {
      setFormData({
        projectName: project.projectName,
        category: project.category,
        sqft: project.sqft || '',
        location: project.location,
        description: project.description,
      });
      setExistingMainPhotoUrl(project.mainPhoto);
      setExistingDescPhotos(project.descriptionPhotos);
    }
  }, [project, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Main Photo Dropzone
  const onDropMain = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const file = acceptedFiles[0];
      setMainPhoto({
          file,
          preview: URL.createObjectURL(file),
          caption: '', // not needed
          id: file.name + Date.now()
      });
      setExistingMainPhotoUrl(null); // clear existing if new one is added
    }
  }, []);
  const { getRootProps: getMainRootProps, getInputProps: getMainInputProps, isDragActive: isMainDragActive } = useDropzone({
    onDrop: onDropMain,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
  });

  // Description Photos Dropzone
  const onDropDesc = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      id: file.name + Date.now()
    }));
    setDescriptionPhotos(prev => [...prev, ...newFiles]);
  }, []);
  const { getRootProps: getDescRootProps, getInputProps: getDescInputProps, isDragActive: isDescDragActive } = useDropzone({
    onDrop: onDropDesc,
    accept: { 'image/*': [] },
  });

  // DND Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const activeId = String(active.id);
        const overId = String(over.id);

        const isReorderingNewPhotos = descriptionPhotos.some(p => p.id === activeId) && descriptionPhotos.some(p => p.id === overId);
        const isReorderingExistingPhotos = existingDescPhotos.some(p => p.url === activeId) && existingDescPhotos.some(p => p.url === overId);

        if (isReorderingNewPhotos) {
            const oldIndex = descriptionPhotos.findIndex(p => p.id === activeId);
            const newIndex = descriptionPhotos.findIndex(p => p.id === overId);
            if (oldIndex !== -1 && newIndex !== -1) {
                setDescriptionPhotos(items => arrayMove(items, oldIndex, newIndex));
            }
        } else if (isReorderingExistingPhotos) {
            const oldIndex = existingDescPhotos.findIndex(p => p.url === activeId);
            const newIndex = existingDescPhotos.findIndex(p => p.url === overId);
            if (oldIndex !== -1 && newIndex !== -1) {
                setExistingDescPhotos(items => arrayMove(items, oldIndex, newIndex));
            }
        }
    }
  }

  const removeNewDescPhoto = (id: string) => {
    setDescriptionPhotos(prev => prev.filter(p => p.id !== id));
  };

  const removeExistingDescPhoto = (url: string) => {
    setExistingDescPhotos(prev => prev.filter(p => p.url !== url));
  };

  const updateCaption = (id: string, caption: string, isExisting: boolean) => {
     if (isExisting) {
        setExistingDescPhotos(prev => prev.map(p => p.url === id ? { ...p, caption } : p));
     } else {
        setDescriptionPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate all files before uploading
      if (mainPhoto) {
        const validation = validateFile(mainPhoto.file);
        if (!validation.valid) {
          toast.error(validation.error!);
          setIsLoading(false);
          return;
        }
      }

      for (const photo of descriptionPhotos) {
        const validation = validateFile(photo.file);
        if (!validation.valid) {
          toast.error(validation.error!);
          setIsLoading(false);
          return;
        }
      }

      if (isEditMode && project) {
        // UPDATE LOGIC
        // Upload main photo separately if new one is provided
        if (mainPhoto) {
          const mainPayload = new FormData();
          mainPayload.append('projectName', formData.projectName);
          mainPayload.append('category', formData.category);
          mainPayload.append('sqft', formData.sqft);
          mainPayload.append('location', formData.location);
          mainPayload.append('description', formData.description);
          mainPayload.append('mainPhoto', mainPhoto.file);
          await updateProject(project._id, mainPayload);
        }

        // Upload description photos one at a time
        for (const photo of descriptionPhotos) {
          const photoPayload = new FormData();
          photoPayload.append('projectName', formData.projectName);
          photoPayload.append('category', formData.category);
          photoPayload.append('sqft', formData.sqft);
          photoPayload.append('location', formData.location);
          photoPayload.append('description', formData.description);
          photoPayload.append('descriptionPhotos', photo.file);
          await updateProject(project._id, photoPayload);
        }

        // Final metadata update
        const formPayload = new FormData();
        formPayload.append('projectName', formData.projectName);
        formPayload.append('category', formData.category);
        formPayload.append('sqft', formData.sqft);
        formPayload.append('location', formData.location);
        formPayload.append('description', formData.description);

        const updates = {
          existing: existingDescPhotos,
          newCaptions: [],
          removed: project.descriptionPhotos
            .filter(p_orig => !existingDescPhotos.some(p_exist => p_exist.url === p_orig.url))
            .map(p => p.url),
        };
        formPayload.append('updates', JSON.stringify(updates));
        await updateProject(project._id, formPayload);

        toast.success('Project updated successfully!');
      } else {
        // CREATE LOGIC
        if (!mainPhoto) {
          toast.error('Main Photo is required.');
          setIsLoading(false);
          return;
        }

        // Send main photo first
        const mainPayload = new FormData();
        mainPayload.append('projectName', formData.projectName);
        mainPayload.append('category', formData.category);
        mainPayload.append('sqft', formData.sqft);
        mainPayload.append('location', formData.location);
        mainPayload.append('description', formData.description);
        mainPayload.append('mainPhoto', mainPhoto.file);

        const projectResponse = await createProject(mainPayload);

        // Send description photos one at a time
        for (const photo of descriptionPhotos) {
          const photoPayload = new FormData();
          photoPayload.append('projectName', formData.projectName);
          photoPayload.append('category', formData.category);
          photoPayload.append('sqft', formData.sqft);
          photoPayload.append('location', formData.location);
          photoPayload.append('description', formData.description);
          photoPayload.append('descriptionPhotos', photo.file);
          await updateProject(projectResponse._id, photoPayload);
        }

        toast.success('Project created successfully!');
      }
      navigate('/admin/projects');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Category" name="category" value={formData.category} onChange={handleChange} options={categoryOptions} required />
                <Input label="Square Feet" name="sqft" value={formData.sqft} onChange={handleChange} />
              </div>
              <Input label="Location" name="location" value={formData.location} onChange={handleChange} required />
              <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} rows={6} required />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Description Photos</CardTitle></CardHeader>
            <CardContent>
              <div {...getDescRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-admin-accent transition-colors ${isDescDragActive ? 'border-admin-accent bg-gray-50' : 'border-gray-300'}`}>
                <input {...getDescInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Drag & drop some files here, or click to select files</p>
                <p className="text-xs text-gray-500">Up to 10 images</p>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={[...existingDescPhotos.map(p => p.url), ...descriptionPhotos.map(p => p.id)]} strategy={rectSortingStrategy}>
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {existingDescPhotos.map(photo => (
                            <SortableImagePreview key={photo.url} id={photo.url} photo={{...photo, preview: photo.url, isExisting: true}} onRemove={removeExistingDescPhoto} onCaptionUpdate={updateCaption} />
                        ))}
                        {descriptionPhotos.map(photo => (
                            <SortableImagePreview key={photo.id} id={photo.id} photo={{...photo, isExisting: false}} onRemove={removeNewDescPhoto} onCaptionUpdate={updateCaption} />
                        ))}
                    </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader><CardTitle>Main Photo</CardTitle></CardHeader>
                <CardContent>
                     <div {...getMainRootProps()} className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-admin-accent transition-colors ${isMainDragActive ? 'border-admin-accent bg-gray-50' : 'border-gray-300'}`}>
                        <input {...getMainInputProps()} />
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Drop a single main photo here</p>
                    </div>
                    {(mainPhoto || existingMainPhotoUrl) && (
                        <div className="mt-4 relative">
                            <img src={mainPhoto?.preview || existingMainPhotoUrl || ''} alt="Main preview" className="w-full h-auto rounded-lg object-cover" />
                            <button type="button" onClick={() => { setMainPhoto(null); setExistingMainPhotoUrl(null); }} className="absolute top-2 right-2 bg-white/70 p-1 rounded-full text-black hover:bg-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="sticky top-24">
                 <Card>
                    <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                    <CardContent>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </form>
  );
};
