/*
For email:
Notice ID:
Date posted
Date Due
Federal Organization: Priority is DHS, US Navy then others
Set Aside:  SDVOSB, Small Business, Veteran Owned
NAICS Code(s): 541330, 541611, 541614, 611430, 611519
Description of the work required:
Location of work:  Remote, or on-site or hybrid  
Topics: Logistics, Data Analysis, Engineering Management, Consulting, System engineering etc. . other similar topics
Number of people required
Period of Performance
Value if they have it
*/
import { fetchDescription } from "./samgov.js";

export async function go() {
  const idNumber = `fe3c90d3a1084200b870b45e1b4e3344`;
  try {
    const descriptionData = await fetchDescription(idNumber);
    console.log("Description Data:", descriptionData);
  } catch (error) {
    console.error("Failed to fetch description:", error.message);
  }
}
