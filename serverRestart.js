import { CronJob } from 'cron';
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const backend_url = process.env.RENDER_URL;

export const job = new CronJob('0 */14 * * * *', async () => {

    console.log("Restarting server every 14 minutes to keep render server up and running");

    fetch(`${backend_url}/api/news?category=general`)
      .then((res) => {
        res.json();
        if(res.ok) console.log(`Server restarted successfully at ${new Date().toTimeString()}`);
        else console.error('Error restarting server:', res.status);
        })
      .catch((error) => console.error(error));

});