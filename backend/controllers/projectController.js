const Project = require('../models/Project');
const { streamUpload, deleteFromCloudinary } = require('../utils/cloudinaryUploader');

// Create a new project
const createProject = async (req, res) => {
  try {
    const { projectName, category, description, sqft, location, descriptionPhotosMeta } = req.body;

    if (!req.files || !req.files.mainPhoto) {
      return res.status(400).json({ message: 'Main photo is required.' });
    }

    // Upload main photo
    const mainPhotoUpload = await streamUpload(req.files.mainPhoto[0].buffer);

    // Upload description photos
    const descriptionPhotos = [];
    const meta = descriptionPhotosMeta ? JSON.parse(descriptionPhotosMeta) : { captions: [] };

    if (req.files.descriptionPhotos) {
      for (let i = 0; i < req.files.descriptionPhotos.length; i++) {
        const file = req.files.descriptionPhotos[i];
        const uploadResult = await streamUpload(file.buffer);
        descriptionPhotos.push({
          url: uploadResult.secure_url,
          caption: meta.captions[i] || '',
        });
      }
    }

    const newProject = new Project({
      projectName,
      category,
      description,
      sqft,
      location,
      mainPhoto: mainPhotoUpload.secure_url,
      descriptionPhotos,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error('Create Project Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a project
// Update a project
// Update a project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectName, category, description, sqft, location, updates } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Basic meta updates
    if (projectName !== undefined) project.projectName = projectName;
    if (category !== undefined) project.category = category;
    if (description !== undefined) project.description = description;
    if (sqft !== undefined) project.sqft = sqft;
    if (location !== undefined) project.location = location;

    // Main photo
    if (req.files?.mainPhoto) {
      try {
        if (project.mainPhoto) {
          await deleteFromCloudinary(project.mainPhoto).catch(err => {
            console.warn('Warning: failed to delete old mainPhoto from Cloudinary', err);
          });
        }
      } catch (err) {
        console.warn('Warning deleting main photo:', err);
      }

      const mainPhotoUpload = await streamUpload(req.files.mainPhoto[0].buffer);
      project.mainPhoto = mainPhotoUpload.secure_url;
    }

    // *** IMPORTANT: new merge-style updates branch ***
    if (updates) {
      const parsedUpdates = typeof updates === 'string' ? JSON.parse(updates) : updates;

      const removedUrls = new Set(parsedUpdates.removed || []);

      // Delete removed photos from Cloudinary (best-effort)
      if (removedUrls.size > 0) {
        await Promise.all(
          Array.from(removedUrls).map(async (url) => {
            try {
              await deleteFromCloudinary(url);
            } catch (err) {
              console.warn('Warning: failed to delete image from Cloudinary', url, err);
            }
          })
        );
      }

      const existingOrdered = Array.isArray(parsedUpdates.existing)
        ? parsedUpdates.existing
        : [];

      // Start from current DB photos, minus removed ones
      const currentPhotos = (project.descriptionPhotos || []).filter(
        (p) => !removedUrls.has(p.url)
      );

      // Map url -> photo object for quick lookup
      const photoMap = new Map(currentPhotos.map((p) => [p.url, p]));

      const finalDescriptionPhotos = [];

      // 1) Put photos mentioned in existingOrdered first (in that order)
      for (const item of existingOrdered) {
        const url = typeof item === 'string' ? item : item.url;
        if (!photoMap.has(url)) continue; // might not exist (e.g. already removed)

        const existingPhoto = photoMap.get(url);
        const updatedCaption =
          typeof item === 'string'
            ? existingPhoto.caption || ''
            : item.caption != null
              ? item.caption
              : existingPhoto.caption || '';

        finalDescriptionPhotos.push({
          url,
          caption: updatedCaption,
        });

        photoMap.delete(url); // so we can later append remaining in original order
      }

      // 2) Append any remaining photos (these include newly added ones from earlier calls)
      for (const p of currentPhotos) {
        if (photoMap.has(p.url)) {
          finalDescriptionPhotos.push(photoMap.get(p.url));
          photoMap.delete(p.url);
        }
      }

      // 3) If this *same* request also has new descriptionPhotos files, upload & append
      if (req.files?.descriptionPhotos && req.files.descriptionPhotos.length > 0) {
        const newCaptions = Array.isArray(parsedUpdates.newCaptions)
          ? parsedUpdates.newCaptions
          : [];

        for (let i = 0; i < req.files.descriptionPhotos.length; i++) {
          const file = req.files.descriptionPhotos[i];
          const uploadResult = await streamUpload(file.buffer);
          finalDescriptionPhotos.push({
            url: uploadResult.secure_url,
            caption: newCaptions[i] || '',
          });
        }
      }

      project.descriptionPhotos = finalDescriptionPhotos;
    } else {
      // *** NO updates: keep your existing "append only" behaviour ***
      if (req.files?.descriptionPhotos) {
        if (!Array.isArray(project.descriptionPhotos)) project.descriptionPhotos = [];

        for (let i = 0; i < req.files.descriptionPhotos.length; i++) {
          const file = req.files.descriptionPhotos[i];
          const uploadResult = await streamUpload(file.buffer);

          let caption = '';
          if (req.body.captions) {
            try {
              const parsed = typeof req.body.captions === 'string'
                ? JSON.parse(req.body.captions)
                : req.body.captions;
              if (Array.isArray(parsed)) caption = parsed[i] || '';
            } catch (err) {
              caption = String(req.body.captions || '');
            }
          } else if (req.body.caption) {
            caption = req.body.caption;
          }

          project.descriptionPhotos.push({
            url: uploadResult.secure_url,
            caption,
          });
        }
      }
    }

    await project.save();
    res.json(project);
  } catch (err) {
    console.error('Update Project Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};




// Delete a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Delete associated images from Cloudinary
    await deleteFromCloudinary(project.mainPhoto);
    if (project.descriptionPhotos && project.descriptionPhotos.length > 0) {
        await Promise.all(project.descriptionPhotos.map(photo => deleteFromCloudinary(photo.url)));
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
