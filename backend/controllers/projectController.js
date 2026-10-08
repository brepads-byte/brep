const Project = require('../models/Project');
const cloudinary = require('cloudinary').v2;

/**
 * @desc Create a new project
 * @route POST /api/projects
 * Note: req.body now contains the photo objects {url, public_id} from the frontend
 */
const createProject = async (req, res) => {
  try {
    // req.body should match our new Schema exactly
    const newProject = new Project(req.body);

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error('Create Project Error:', err);
    res.status(400).json({ message: 'Validation failed', error: err.message });
  }
};

/**
 * @desc Get all projects
 * @route GET /api/projects
 */
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .select("-descriptionPhotos -description") // ⚡ Projection optimization filter
      .sort({ createdAt: -1 });
      
    res.json(projects);
  } catch (err) {
    console.error('Get Projects List Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get single project
 * @route GET /api/projects/:id
 * ✅ RICH PAYLOAD: Keeps all data fields completely intact for the deep detail view.
 */
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error('Get Project By ID Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Update project
 * Note: Netlify sends the final state of the project as JSON
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch the OLD project state before doing anything
    const existingProject = await Project.findById(id);
    if (!existingProject) return res.status(404).json({ message: 'Project not found' });

    // 2. Cleanup Main Photo: If the public_id changed, destroy the old one
    const oldMainId = existingProject.mainPhoto?.public_id;
    const newMainId = req.body.mainPhoto?.public_id;
    
    if (oldMainId && oldMainId !== newMainId) {
      await cloudinary.uploader.destroy(oldMainId);
    }

    // 3. Cleanup Description Photos: Find photos that exist in the DB but are missing from req.body
    const oldDescPhotos = existingProject.descriptionPhotos || [];
    const newDescPhotos = req.body.descriptionPhotos || [];
    const newDescIds = newDescPhotos.map(photo => photo.public_id); // Array of new IDs

    // Filter out the ones that got deleted by the user
    const photosToDelete = oldDescPhotos.filter(oldPhoto => !newDescIds.includes(oldPhoto.public_id));

    // Destroy all orphaned description photos simultaneously
    if (photosToDelete.length > 0) {
      await Promise.all(
        photosToDelete.map(photo => cloudinary.uploader.destroy(photo.public_id))
      );
    }

    // 4. Now that Cloudinary is clean, update MongoDB with the new data
    const updatedProject = await Project.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.json(updatedProject);
  } catch (err) {
    console.error('Update Project Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * @desc Delete project and its assets from Cloudinary
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // 1. Delete Main Photo from Cloudinary using public_id
    if (project.mainPhoto?.public_id) {
      await cloudinary.uploader.destroy(project.mainPhoto.public_id);
    }

    // 2. Delete Gallery Photos from Cloudinary in parallel
    if (project.descriptionPhotos?.length > 0) {
      const deletePromises = project.descriptionPhotos.map(photo => 
        cloudinary.uploader.destroy(photo.public_id)
      );
      await Promise.all(deletePromises);
    }

    // 3. Finally, delete the document from MongoDB
    await project.deleteOne();

    res.json({ message: 'Project and all cloud assets deleted successfully' });
  } catch (err) {
    console.error('Delete Project Error:', err);
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