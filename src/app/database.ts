// database.ts
import bcrypt from "bcryptjs";
const userData = [
    {
      id: "1",
      email: "abc@gmail.com",
      password: await bcrypt.hash("password123", 10), // Hashed password
    },
    {
      id: "2",
      email: "xyz@gmail.com",
      password: await bcrypt.hash("password456", 10), // Hashed password
    },
  ];
  
  export default userData;