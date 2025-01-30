const projectData = require("../data/projectData.json");
const sectorData = require("../data/sectorData.json");

let projects = [];

function initialize() {
    return new Promise((resolve, reject) => {
        if (projectData.length === 0 || sectorData.length === 0) {
            reject("Error: Data files are empty.");
        }

        projects = projectData.map(project => {
            const sector = sectorData.find(sector => sector.id === project.sector_id);
            return { ...project, sector: sector ? sector.sector_name : "Unknown" };
        });

        resolve();
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        projects.length ? resolve(projects) : reject("No projects found.");
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const project = projects.find(proj => proj.id === projectId);
        project ? resolve(project) : reject(`Project with ID ${projectId} not found.`);
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const filteredProjects = projects.filter(proj => proj.sector.toLowerCase().includes(sector.toLowerCase()));
        filteredProjects.length ? resolve(filteredProjects) : reject(`No projects found for sector: ${sector}`);
    });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
