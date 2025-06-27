import { failedAudits, level, projectsQuery, succeededAudits, user, userInfo, xp } from "./querys.js"
import { profilHtml } from "./htmls.js";
import { Fetch } from "./fetchi.js";
import { Showlogin } from "./login.js";
export async function ShowProfile() {
    document.body.innerHTML = ""
    document.body.innerHTML = profilHtml
    const data = await Fetch(user);
    console.log(data);
    const header = document.getElementById("user")
    const p = document.createElement("strong")
    p.innerHTML = `Welcome ${data.data.user[0].login}`
    header.appendChild(p)
    const logout = document.getElementById("log-out")
    logout.addEventListener("click", () => {
        localStorage.removeItem("jwt")
        window.location.reload()
        Showlogin()
    })
    const body = document.querySelector("body")
    const div = document.createElement("div");
    div.className = "level-xp";
    body.appendChild(div);
    await AboutUser(userInfo)
    await xplevel(xp, level)
    await createGraphsContainer(projectsQuery, failedAudits, succeededAudits)
}
export async function AboutUser(query) {
    const info = await Fetch(query);
    console.log(info);
    const data = info.data.user[0].attrs;
    const container = document.createElement("div");
    container.className = "profile-container";
    const aboutUser = document.createElement("div");
    aboutUser.className = "about-user";
    aboutUser.innerHTML = `
        <button id = "show or hide" ><h2 >About User</h2></button>
        <div id = "about-user-info" style = "display : none ">
        <p><strong>Full name :</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>CIN :</strong> ${data.cin}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>tel :</strong> ${data.tel}</p>
        <p><strong>Gender :</strong> ${data.gender}</p>
        <p><strong>dateOfBirth :</strong> ${new Date(data.dateOfBirth).toLocaleDateString()}</p>
        <p><strong>birthCity :</strong> ${data.birthCity}</p>
        <p><strong>Adress :</strong> ${data.addressStreet}</p>
        <p><strong>
        
        birthCountry :</strong> ${data.birthCountry}</p>
        </div>
    `;
    container.appendChild(aboutUser);
    document.body.appendChild(container);
     const infos = document.getElementById("show or hide");
    const aboutUserInfo = document.getElementById("about-user-info");
     infos.addEventListener("click", () => {
    if (aboutUserInfo.style.display === "block") {
        aboutUserInfo.style.display = "none";
    }
    else {          
        aboutUserInfo.style.display = "block";
    }
    })
    
}
const xplevel = async (xp, levell) => {
    const xpData = await Fetch(xp)
    if(xpData.data.transaction_aggregate.aggregate.sum.amount === null){
        const levelXp = document.querySelector(".level-xp")
        levelXp.innerHTML = `
        <div class="xp-box">
            <span class="xp-label">XP</span>
            <span class="xp-value">No XP</span>
        </div>
        <div class="level-box">
            <span class="level-label">Level</span>
            <span class="level-value">No Level</span>
        </div>
        `
        return;
    }
    const levelData = await Fetch(levell)
    if(levelData.data.transaction[0].amount === null){
        const levelXp = document.querySelector(".level-xp")
        levelXp.innerHTML = `
        <div class="xp-box">
            <span class="xp-label">XP</span>
            <span class="xp-value">No XP</span>
        </div>
        <div class="level-box">
            <span class="level-label">Level</span>
            <span class="level-value">No Level</span>
        </div>
        `
        return;
    }
    const numXp = xpData.data.transaction_aggregate.aggregate.sum.amount
    const level = levelData.data.transaction[0].amount
    const xpConv = convertXp(numXp)
    const levelXp = document.querySelector(".level-xp")

    levelXp.innerHTML = `
        <div class="xp-box">
            <span class="xp-label">XP</span>
            <span class="xp-value">${xpConv}</span>
        </div>
        <div class="level-box">
            <span class="level-label">Level</span>
            <span class="level-value">${level}</span>
        </div>
    `
}
const convertXp = (num) => {
    num /= 1000
    if (num < 1000) return num.toFixed(2) + "KB"
    else {
        num /= 1000
        return num.toFixed(2) + "MB"
    }
}

const displayProjects = async (query) => {
    const projectData = await Fetch(query);
    console.log('projectData');
    console.log(projectData);
    
    let projects = projectData.data.user[0].transactions || [];
    
    // Create a simple container
    const container = document.createElement("div");
    container.className = "projects-graph-container";
    
    const title = document.createElement("h2");
    title.textContent = "My Projects";
    container.appendChild(title);
    
    if (projects.length === 0) {
        const noData = document.createElement("p");
        noData.textContent = "No projects found";
        container.appendChild(noData);
        document.body.appendChild(container);
        return;
    }
    
    const screenWidth = window.innerWidth;
    let maxProjects = 8;
    projects = projects.filter(project => project.amount > 0);
    const simpleProjects = projects.slice(0, maxProjects);
    
    // Find the biggest XP amount (this will be our 100% height)
    let biggestXP = 0;
    for (let i = 0; i < simpleProjects.length; i++) {
        if (simpleProjects[i].amount > biggestXP) {
            biggestXP = simpleProjects[i].amount;
        }
    }
    
    // Create simple SVG with responsive dimensions
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.width = "100%";
    svg.style.height = screenWidth < 480 ? "250px" : "300px";
    svg.style.background = "#f0f0f0";
    svg.style.borderRadius = "10px";
    svg.setAttribute("viewBox", `0 0 ${screenWidth < 480 ? 400 : 700} ${screenWidth < 480 ? 250 : 300}`);
    
    // Responsive sizing
    const barWidth = screenWidth < 480 ? 40 : 60;
    const spacing = screenWidth < 480 ? 15 : 20;
    const maxHeight = screenWidth < 480 ? 150 : 200;
    const baseY = screenWidth < 480 ? 200 : 250;
    // Draw each project as a simple bar
    for (let i = 0; i < simpleProjects.length; i++) {
        const project = simpleProjects[i];
        const xpAmount = project.amount || 0;
        const projectName = project.object?.name || "Unknown";
        
        // Simple percentage: how tall should this bar be?
        const barHeight = (xpAmount / biggestXP) * maxHeight;
        
        // Simple positioning: put bars next to each other
        const x = i * (barWidth + spacing);
        const y = baseY - barHeight; // Start from bottom and go up
        
        // Create the bar (rectangle)
        const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bar.setAttribute("x", x);
        bar.setAttribute("y", y);
        bar.setAttribute("width", barWidth);
        bar.setAttribute("height", barHeight);
        bar.setAttribute("fill", "#667eea");
        bar.setAttribute("rx", "3");
        svg.appendChild(bar);
        
        // Add the XP number on top of bar
        const xpText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        xpText.setAttribute("x", x + barWidth / 2); // Center of bar
        xpText.setAttribute("y", y - 5); // Just above bar
        xpText.setAttribute("text-anchor", "middle");
        xpText.setAttribute("fill", "#333");
        xpText.setAttribute("font-size", screenWidth < 480 ? "10" : "12");
        xpText.textContent = convertXp(xpAmount);
        svg.appendChild(xpText);
        
        // Add project name below bar
        const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        nameText.setAttribute("x", x + barWidth / 2); // Center of bar
        nameText.setAttribute("y", baseY + 20); // Below the bars
        nameText.setAttribute("text-anchor", "middle");
        nameText.setAttribute("fill", "#333");
        nameText.setAttribute("font-size", screenWidth < 480 ? "8" : "10");
        // Make name shorter based on screen size
        const maxLength = screenWidth < 480 ? 8 : 12;
        const shortName = projectName.length > maxLength ? projectName.slice(0, maxLength) + "..." : projectName;
        nameText.textContent = shortName;
        svg.appendChild(nameText);
    }
    
    container.appendChild(svg);
    document.body.appendChild(container);
};
const auditSvg = async (failedD, succeeded) => {
    const respFailed = await Fetch(failedD);
    const respSucceeded = await Fetch(succeeded);
    const countFailed = respFailed.data.user[0].audits_aggregate.aggregate.count;
    const countSucceeded = respSucceeded.data.user[0].audits_aggregate.aggregate.count;
    const total = countSucceeded + countFailed;
    const successRatio = countSucceeded / total;
    const failedRatio = countFailed / total;
    const circleLength = 2 * Math.PI * 90;

    const successStroke = circleLength * successRatio;
    const failedStroke = circleLength * failedRatio;

    // Use the CSS class for 25% sizing
    const divSvg = document.createElement("div");
    divSvg.className = "audit-graph-container";

    const title = document.createElement("h2");
    title.textContent = "Audit Results";
    divSvg.appendChild(title);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");

    // Remove the width/height attributes - let CSS control sizing
    svg.setAttribute("viewBox", "0 0 200 200");

    const bg = document.createElementNS(svgNS, "circle");
    bg.setAttribute("cx", "100");
    bg.setAttribute("cy", "100");
    bg.setAttribute("r", "90");
    bg.setAttribute("stroke", "#eee");
    bg.setAttribute("stroke-width", "20");
    bg.setAttribute("fill", "none");
    svg.appendChild(bg);

    const success = document.createElementNS(svgNS, "circle");
    success.setAttribute("cx", "100");
    success.setAttribute("cy", "100");
    success.setAttribute("r", "90");
    success.setAttribute("stroke", "green");
    success.setAttribute("stroke-width", "20");
    success.setAttribute("fill", "none");
    success.setAttribute("stroke-dasharray", `${successStroke} ${circleLength}`);
    success.setAttribute("stroke-dashoffset", "0");

    svg.appendChild(success);

    const failed = document.createElementNS(svgNS, "circle");
    failed.setAttribute("cx", "100");
    failed.setAttribute("cy", "100");
    failed.setAttribute("r", "90");
    failed.setAttribute("stroke", "red");
    failed.setAttribute("stroke-width", "20");
    failed.setAttribute("fill", "none");
    failed.setAttribute("stroke-dasharray", `${failedStroke} ${circleLength}`);
    failed.setAttribute("stroke-dashoffset", `-${successStroke}`);

    svg.appendChild(failed);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "100");
    text.setAttribute("y", "110");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "30");
    text.textContent = `${total} Audits`;
    svg.appendChild(text);

    divSvg.appendChild(svg);

    const info = document.createElement("div");
    const pS = document.createElement("p");
    pS.innerHTML = `success-audits ✅: ${Math.round(successRatio * 100)}%`;
    pS.style.color = "green";

    const pF = document.createElement("p");
    pF.innerHTML = `failed-audits❌: ${Math.round(failedRatio * 100)}% `;
    pF.style.color = "red";

    info.append(pS, pF);
    info.style.margin = "10px 0";
    info.style.fontSize = "0.9rem";
    divSvg.appendChild(info);

    document.body.appendChild(divSvg);
};

// If you have an audit graph function, make sure it uses the correct CSS class
const displayAudits = async (query) => {
    const auditData = await Fetch(query);
    console.log(auditData);
    
    // Create container with the correct CSS class
    const container = document.createElement("div");
    container.className = "audit-graph-container"; // This is the key - use the right class
    
    const title = document.createElement("h2");
    title.textContent = "Audit Results";
    container.appendChild(title);
    
    // Create SVG that will respect the CSS sizing
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // Don't set width/height in JS - let CSS control it
    svg.setAttribute("viewBox", "0 0 300 200");
    
    // Your audit chart code here...
    
    container.appendChild(svg);
    document.body.appendChild(container);
};

const createGraphsContainer = async (projectsQuery, failedAudits, succeededAudits) => {
    // Create the main container div
    const graphsContainer = document.createElement("div");
    graphsContainer.className = "graphs-container";
    graphsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 30px;
        margin: 20px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
    `;

    // Add a main title for the graphs section
    const mainTitle = document.createElement("h1");
    mainTitle.textContent = "Statistics Dashboard";
    mainTitle.style.cssText = `
        text-align: center;
        color: #333;
        margin-bottom: 20px;
        font-size: 2rem;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    `;
    graphsContainer.appendChild(mainTitle);

    // Create project graph section
    const projectSection = await createProjectGraph(projectsQuery);
    graphsContainer.appendChild(projectSection);

    // Create audit graph section  
    const auditSection = await createAuditGraph(failedAudits, succeededAudits);
    graphsContainer.appendChild(auditSection);

    // Append to body
    document.body.appendChild(graphsContainer);
};

const createProjectGraph = async (query) => {
    const projectData = await Fetch(query);
    console.log('projectData');
    console.log(projectData);
    
    let projects = projectData.data.user[0].transactions || [];
    
    // Create project container
    const container = document.createElement("div");
    container.className = "projects-graph-section";
    container.style.cssText = `
        background: rgba(102, 126, 234, 0.05);
        padding: 20px;
        border-radius: 10px;
        border-left: 4px solid #667eea;
    `;
    
    const title = document.createElement("h2");
    title.textContent = "My Projects";
    title.style.cssText = `
        color: #333;
        margin-bottom: 15px;
        text-align: center;
    `;
    container.appendChild(title);
    
    if (projects.length === 0) {
        const noProjects = document.createElement("p");
        noProjects.textContent = "No projects found";
        noProjects.style.textAlign = "center";
        container.appendChild(noProjects);
        return container;
    }
    
    const screenWidth = window.innerWidth;
    let maxProjects = 8;
    projects = projects.filter(project => project.amount > 0);
    const simpleProjects = projects.slice(0, maxProjects);
    
    // Find the biggest XP amount (this will be our 100% height)
    let biggestXP = 0;
    for (let i = 0; i < simpleProjects.length; i++) {
        if (simpleProjects[i].amount > biggestXP) {
            biggestXP = simpleProjects[i].amount;
        }
    }
    
    // Create simple SVG with responsive dimensions
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.width = "100%";
    svg.style.height = screenWidth < 480 ? "250px" : "300px";
    svg.style.background = "#f9f9f9";
    svg.style.borderRadius = "10px";
    svg.setAttribute("viewBox", `0 0 ${screenWidth < 480 ? 400 : 700} ${screenWidth < 480 ? 250 : 300}`);
    
    // Responsive sizing
    const barWidth = screenWidth < 480 ? 40 : 60;
    const spacing = screenWidth < 480 ? 15 : 20;
    const maxHeight = screenWidth < 480 ? 150 : 200;
    const baseY = screenWidth < 480 ? 200 : 250;
    
    // Draw each project as a simple bar
    for (let i = 0; i < simpleProjects.length; i++) {
        const project = simpleProjects[i];
        const xpAmount = project.amount || 0;
        const projectName = project.object?.name || "Unknown";
        
        // Simple percentage: how tall should this bar be?
        const barHeight = (xpAmount / biggestXP) * maxHeight;
        
        // Simple positioning: put bars next to each other
        const x = i * (barWidth + spacing);
        const y = baseY - barHeight; // Start from bottom and go up
        
        // Create the bar (rectangle)
        const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bar.setAttribute("x", x);
        bar.setAttribute("y", y);
        bar.setAttribute("width", barWidth);
        bar.setAttribute("height", barHeight);
        bar.setAttribute("fill", "#667eea");
        bar.setAttribute("rx", "3");
        svg.appendChild(bar);
        
        // Add the XP number on top of bar
        const xpText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        xpText.setAttribute("x", x + barWidth / 2); // Center of bar
        xpText.setAttribute("y", y - 5); // Just above bar
        xpText.setAttribute("text-anchor", "middle");
        xpText.setAttribute("fill", "#333");
        xpText.setAttribute("font-size", screenWidth < 480 ? "10" : "12");
        xpText.textContent = Math.round(xpAmount / 1000) + "k";
        svg.appendChild(xpText);
        
        // Add project name at bottom (rotated for readability)
        const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        nameText.setAttribute("x", x + barWidth / 2);
        nameText.setAttribute("y", baseY + 15);
        nameText.setAttribute("text-anchor", "middle");
        nameText.setAttribute("fill", "#666");
        nameText.setAttribute("font-size", screenWidth < 480 ? "8" : "10");
        nameText.textContent = projectName.length > 10 ? projectName.substring(0, 10) + "..." : projectName;
        svg.appendChild(nameText);
    }
    
    container.appendChild(svg);
    return container;
};

const createAuditGraph = async (failedD, succeeded) => {
    const respFailed = await Fetch(failedD);
    const respSucceeded = await Fetch(succeeded);
    const countFailed = respFailed.data.user[0].audits_aggregate.aggregate.count;
    const countSucceeded = respSucceeded.data.user[0].audits_aggregate.aggregate.count;
    const total = countSucceeded + countFailed;
    const successRatio = countSucceeded / total;
    const failedRatio = countFailed / total;
    const circleLength = 2 * Math.PI * 90;

    const successStroke = circleLength * successRatio;
    const failedStroke = circleLength * failedRatio;

    // Create audit container
    const divSvg = document.createElement("div");
    divSvg.className = "audit-graph-section";
    divSvg.style.cssText = `
        background: rgba(231, 76, 60, 0.05);
        padding: 20px;
        border-radius: 10px;
        border-left: 4px solid #e74c3c;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;

    const title = document.createElement("h2");
    title.textContent = "Audit Results";
    title.style.cssText = `
        color: #333;
        margin-bottom: 15px;
        text-align: center;
    `;
    divSvg.appendChild(title);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    svg.style.width = "200px";
    svg.style.height = "200px";

    const bg = document.createElementNS(svgNS, "circle");
    bg.setAttribute("cx", "100");
    bg.setAttribute("cy", "100");
    bg.setAttribute("r", "90");
    bg.setAttribute("stroke", "#eee");
    bg.setAttribute("stroke-width", "20");
    bg.setAttribute("fill", "none");
    svg.appendChild(bg);

    const success = document.createElementNS(svgNS, "circle");
    success.setAttribute("cx", "100");
    success.setAttribute("cy", "100");
    success.setAttribute("r", "90");
    success.setAttribute("stroke", "green");
    success.setAttribute("stroke-width", "20");
    success.setAttribute("fill", "none");
    success.setAttribute("stroke-dasharray", `${successStroke} ${circleLength}`);
    success.setAttribute("stroke-dashoffset", "0");
    svg.appendChild(success);

    const failed = document.createElementNS(svgNS, "circle");
    failed.setAttribute("cx", "100");
    failed.setAttribute("cy", "100");
    failed.setAttribute("r", "90");
    failed.setAttribute("stroke", "red");
    failed.setAttribute("stroke-width", "20");
    failed.setAttribute("fill", "none");
    failed.setAttribute("stroke-dasharray", `${failedStroke} ${circleLength}`);
    failed.setAttribute("stroke-dashoffset", `-${successStroke}`);
    svg.appendChild(failed);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "100");
    text.setAttribute("y", "110");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "30");
    text.textContent = `${total} Audits`;
    svg.appendChild(text);

    divSvg.appendChild(svg);

    const info = document.createElement("div");
    info.style.cssText = `
        display: flex;
        gap: 20px;
        margin-top: 15px;
        flex-wrap: wrap;
        justify-content: center;
    `;
    
    const pS = document.createElement("p");
    pS.innerHTML = `✅ Success: ${Math.round(successRatio * 100)}%`;
    pS.style.cssText = `
        color: green;
        font-weight: 600;
        margin: 0;
        padding: 5px 10px;
        background: rgba(0, 255, 0, 0.1);
        border-radius: 5px;
    `;

    const pF = document.createElement("p");
    pF.innerHTML = `❌ Failed: ${Math.round(failedRatio * 100)}%`;
    pF.style.cssText = `
        color: red;
        font-weight: 600;
        margin: 0;
        padding: 5px 10px;
        background: rgba(255, 0, 0, 0.1);
        border-radius: 5px;
    `;

    info.append(pS, pF);
    divSvg.appendChild(info);

    return divSvg;
};