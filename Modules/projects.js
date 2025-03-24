require('dotenv').config();
require('pg');
const { Sequelize, Op } = require('sequelize');

const sequelize = new Sequelize(process.env.PG_CONNECTION_STRING, {
    dialect: 'postgres',
    logging: false
});

sequelize.authenticate()
    .then(() => console.log('Connected to the database successfully.'))
    .catch(err => console.error('Unable to connect to the database:', err));

const Sector = sequelize.define('Sector', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sector_name: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, { timestamps: false });

const Project = sequelize.define('Project', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true  
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true 
    },
    feature_img_url: Sequelize.STRING,
    summary_short: Sequelize.TEXT,
    intro_short: Sequelize.TEXT,
    impact: Sequelize.TEXT,
    original_source_url: Sequelize.STRING,
    sector_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, { timestamps: false });


Project.belongsTo(Sector, { foreignKey: 'sector_id' });

async function initialize() {
    try {
        await sequelize.sync();
        console.log("Database synchronized successfully.");
    } catch (error) {
        console.error("Error syncing database:", error);
    }
}

async function getAllProjects() {
    try {
        const projects = await Project.findAll({ include: Sector });
        if (!projects.length) throw new Error("No projects found.");
        return projects;
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
    }
}

async function getProjectById(projectId) {
    try {
        const project = await Project.findOne({
            where: { id: projectId },
            include: Sector
        });
        if (!project) throw new Error(`Project with ID ${projectId} not found.`);
        return project;
    } catch (error) {
        console.error(`Error fetching project with ID ${projectId}:`, error);
        throw error;
    }
}

async function getProjectsBySector(sectorName) {
    try {
        const projects = await Project.findAll({
            include: [{ model: Sector, where: { sector_name: { [Op.iLike]: `%${sectorName}%` } } }]
        });
        if (!projects.length) throw new Error(`No projects found for sector: ${sectorName}`);
        return projects;
    } catch (error) {
        console.error(`Error fetching projects for sector "${sectorName}":`, error);
        throw error;
    }
}

async function getAllSectors() {
    try {
        return await Sector.findAll();
    } catch (error) {
        console.error("Error fetching sectors:", error);
        throw new Error("Could not fetch sectors.");
    }
}

async function addProject(projectData) {
    try {
        console.log("Received data:", projectData);

        if (!projectData.sector_id || isNaN(projectData.sector_id)) {
            throw new Error("Invalid sector ID.");
        }

        const newProject = await Project.create({
            title: projectData.title,
            feature_img_url: projectData.feature_img_url,
            summary_short: projectData.summary_short,
            intro_short: projectData.intro_short,
            impact: projectData.impact,
            original_source_url: projectData.original_source_url,
            sector_id: parseInt(projectData.sector_id),
        });

        console.log("Project added successfully:", newProject);
        return newProject;

    } catch (error) {
        console.error("Error adding project:", error);

        if (error.name === "SequelizeUniqueConstraintError") {
            throw new Error("A project with the same title already exists.");
        } else if (error.name === "SequelizeValidationError") {
            throw new Error("Invalid data provided. Please check the form fields.");
        } else if (error.message.includes("duplicate key value")) {
            throw new Error("ID conflict: Reset the sequence in PostgreSQL.");
        }

        throw new Error("An unknown error occurred while adding the project.");
    }
}



async function editProject(projectId, projectData) {
    try {
        const result = await Project.update(
            {
                title: projectData.title,
                feature_img_url: projectData.feature_img_url,
                summary_short: projectData.summary_short,
                intro_short: projectData.intro_short,
                impact: projectData.impact,
                original_source_url: projectData.original_source_url,
                sector_id: parseInt(projectData.sector_id),
            },
            { where: { id: projectId } }
        );

        return result[0] !== 0;
    } catch (error) {
        console.error("Error updating project:", error);
        throw new Error(error.message || "An error occurred while updating the project.");
    }
}

async function deleteProject(projectId) {
    try {
        const deletedProject = await Project.destroy({ where: { id: projectId } });

        if (deletedProject === 0) {
            throw new Error("Project not found or already deleted.");
        }
    } catch (error) {
        console.error("Error deleting project:", error);
        throw new Error("An error occurred while deleting the project.");
    }
}

module.exports = { 
    initialize, 
    getAllProjects, 
    getProjectById, 
    getProjectsBySector, 
    getAllSectors, 
    addProject, 
    editProject,
    deleteProject 
};

if (require.main === module) {
    initialize();
}
