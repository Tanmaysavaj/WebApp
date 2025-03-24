/******************************************************************************** 
*  WEB322 – Assignment 05
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Tanmay Dineshbhai Savaj 
*  Student ID: 131573230 
*  Date: 20 March 2025
********************************************************************************/

const express = require("express");
const path = require("path");
const {
    getAllProjects,
    getProjectsBySector,
    getProjectById,
    getAllSectors,
    addProject,
    editProject,
    deleteProject,
    initialize
} = require("./Modules/projects.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));

app.use(express.static(path.join(__dirname, "Public")));
app.use(express.urlencoded({ extended: true }));

initialize()
    .then(() => console.log("Project Data Initialized"))
    .catch(err => console.error("Initialization failed:", err));

app.get("/", async (req, res) => {
    try {
        const allProjects = await getAllProjects();
        const projects = allProjects.slice(0, 9);
        res.render("home", { projects, page: "/" });
    } catch (err) {
        console.error("Error loading home page:", err);
        res.status(500).render("500", { message: "Error loading home page" });
    }
});

app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

app.get("/solutions/projects", async (req, res) => {
    try {
        let projects;
        if (req.query.sector) {
            projects = await getProjectsBySector(req.query.sector);
            if (projects.length === 0) {
                return res.status(404).render("404", { message: "No projects found in this sector." });
            }
        } else {
            projects = await getAllProjects();
        }
        res.render("projects", { projects, page: "/solutions/projects" });
    } catch (err) {
        console.error("Error loading projects:", err);
        res.status(500).render("500", { message: "Error loading projects" });
    }
});

app.get("/solutions/projects/:id", async (req, res) => {
    try {
        const project = await getProjectById(parseInt(req.params.id));
        if (!project) {
            return res.status(404).render("404", { message: "Project not found." });
        }
        res.render("project", { project, page: "" });
    } catch (err) {
        console.error("Error loading project:", err);
        res.status(500).render("500", { message: "Error loading project" });
    }
});

app.get("/solutions/addProject", async (req, res) => {
    try {
        const sectors = await getAllSectors();
        res.render("addProject", { sectors, page: "/solutions/addProject" });
    } catch (err) {
        console.error("Error loading add project form:", err);
        res.status(500).render("500", { message: `Error loading sectors: ${err.message}` });
    }
});

app.post("/solutions/addProject", async (req, res) => {
    try {
        console.log("Form submitted with:", req.body);

        // Validate required fields
        if (!req.body.title || !req.body.sector_id) {
            throw new Error("Title and sector are required.");
        }

        await addProject(req.body);
        res.redirect("/solutions/projects");  // Redirect to projects page
    } catch (error) {
        console.error("Error adding project:", error);
        res.status(500).render("500", { error: error.message });
    }
});



app.get("/solutions/editProject/:id", async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (isNaN(projectId)) throw new Error("Invalid project ID");

        const project = await getProjectById(projectId);
        if (!project) {
            return res.status(404).render("404", { message: "Project not found." });
        }

        const sectors = await getAllSectors();
        res.render("editProject", { project, sectors, page: "/solutions/editProject" });
    } catch (err) {
        console.error("Error loading edit project form:", err);
        res.status(500).render("500", { message: `Error loading edit form: ${err.message}` });
    }
});

app.post("/solutions/editProject/:id", async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (isNaN(projectId)) throw new Error("Invalid project ID");

        const success = await editProject(projectId, req.body);
        if (!success) {
            return res.status(404).render("404", { message: "Project update failed. Project not found." });
        }

        res.redirect("/solutions/projects");
    } catch (err) {
        console.error("Error updating project:", err);
        res.status(500).render("500", { message: `Error updating project: ${err.message}` });
    }
});

app.get("/solutions/deleteProject/:id", async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (isNaN(projectId)) throw new Error("Invalid project ID");

        await deleteProject(projectId);
        res.redirect("/solutions/projects");
    } catch (err) {
        console.error("Error deleting project:", err);
        res.status(500).render("500", { message: `Error deleting project: ${err.message}` });
    }
});

// 404 Error Handler (Handles Not Found Pages)
app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found.", page: "/" });
});

// 500 Error Handler (Handles Internal Server Errors)
app.use((err, req, res, next) => {
    console.error("Server error:", err.stack);
    res.status(500).render("500", { message: err.message || "Something went wrong!" });
});


if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
