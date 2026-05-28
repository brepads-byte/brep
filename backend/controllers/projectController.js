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
    
    // We simply find the project and update it with the new data
    // The "merging" logic now happens on the Frontend (Netlify)
    const updatedProject = await Project.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });

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