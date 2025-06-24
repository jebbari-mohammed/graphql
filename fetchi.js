import { Showlogin } from "./login.js"
export const Fetch = async (query) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
        Showlogin();
        return;
    }
    
    const url = "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql";
    
    try {
       
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        });
        
        const data = await response.json();
       
        
        if (data.errors) {
            Showlogin()
            return;
        }
        
        return data; // ✅ return the data
        
    } catch (error) {
       
        console.log( "erorr in ",query);
        console.error("Error:", error);
    }
};