/******************************************************************************** 
*  WEB322 – Assignment 03
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Tanmay Dineshbhai Savaj 
*  Student ID: 131573230 
*  Date: 12 Feb. 2025
********************************************************************************/

const express = require("express");
const path = require("path");
const projectData = require("./Modules/projects.js");  

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from Public directory
app.use(express.static(path.join(__dirname, "Public")));  

// Initialize project data
projectData.initialize()
    .then(() => console.log("Project Data Initialized"))
    .catch(err => console.error("Initialization failed:", err));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Views", "home.html")); 
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "Views", "about.html"));  
});

app.get("/solutions/projects", async (req, res) => {
    try {
        if (req.query.sector) {
            const data = await projectData.getProjectsBySector(req.query.sector);
            if (data.length === 0) {
                return res.status(404).send("No projects found in this sector.");
            }
            return res.json(data);
        }
        const data = await projectData.getAllProjects();
        res.json(data);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get("/solutions/projects/:id", async (req, res) => {
    try {
        const project = await projectData.getProjectById(parseInt(req.params.id));
        if (!project) {
            return res.status(404).send("Project not found.");
        }
        res.json(project);
    } catch (err) {
        res.status(404).send(err);
    }
});

// Handle 404 Errors
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "Views", "404.html"));
    return; // Ensure the response cycle is terminated
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
