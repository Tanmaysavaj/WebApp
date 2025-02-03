/******************************************************************************** 
*  WEB322 – Assignment 02 
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Tanmay Dineshbhai Savaj 
*  Student ID: 131573230 
*  Date: 28 Jan. 2025
********************************************************************************/

const express = require("express");
const projectData = require("./modules/projects");  

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize project data
projectData.initialize()
    .then(() => console.log("Project Data Initialized"))
    .catch(err => {
        console.error("Initialization failed:", err);
    });

// Define Routes
app.get("/", (req, res) => {
    res.send("Assignment 2: Tanmay Dineshbhai Savaj - 131573230");
});

app.get("/solutions/projects", async (req, res) => {
    try {
        const data = await projectData.getAllProjects();
        res.json(data);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get("/solutions/projects/id-demo", async (req, res) => {
    try {
        const data = await projectData.getProjectById(7);
        res.json(data);
    } catch (err) {
        res.status(404).send(err);
    }
});

app.get("/solutions/projects/sector-demo", async (req, res) => {
    try {
        const data = await projectData.getProjectsBySector("agriculture");
        res.json(data);
    } catch (err) {
        res.status(404).send(err);
    }
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
