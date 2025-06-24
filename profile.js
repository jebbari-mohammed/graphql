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
    AboutUser(userInfo)
    xplevel(xp, level)
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
        <div id = "about-user-info" style = "display : block ">
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
    const levelData = await Fetch(levell)
    const numXp = xpData.data.transaction_aggregate.aggregate.sum.amount
    const level = levelData.data.transaction[0].amount
    const xpConv = convertXp(numXp)
    const levelXp = document.querySelector(".level-xp")

    levelXp.innerHTML = `
      <p id= "level"><strong>Current Level :</strong> ${level}</p>
       <p id="xp"><strong>Total XP :</strong> ${xpConv}</p>
     `

    //    document.getElementById("user-xp").append(levelXp)
}
const convertXp = (num) => {
    num /= 1000
    if (num < 1000) return num.toFixed(2) + "KB"
    else {
        num /= 1000
        return num.toFixed(2) + "MB"
    }
}