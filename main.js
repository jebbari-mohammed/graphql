import { Showlogin } from './login.js';
import { ShowProfile } from './profile.js';

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        Showlogin();
    } else {
        if (checkjwt){
            ShowProfile();
        } else {
            localStorage.removeItem('jwt');
            Showlogin();
        }
    }
 async function checkjwt() {
    const jwt = localStorage.getItem("jwt");
        try {
          const response = await fetch("https://learn.zone01oujda.ma/api/auth/signin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${jwt}`
            },
            body: JSON.stringify({
              query: `{ user { id } }`
            })
          });
          const data = await response.json();
          console.log('hereee');
          console.log(data);
          if (data.data && data.data.user) {
            return true;
          } else {
            return false;
          }
        } catch (err) {
          console.log(err);
      
          return false;
        }
}