require("dotenv").config();
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("./models/User"); 

const MAJORS = [
  "Accounting", "Architecture", "Art History", "Biology", "Business Administration",
  "Chemistry", "Civil Engineering", "Communications", "Computer Engineering",
  "Computer Science", "Criminal Justice", "Economics", "Education",
  "Electrical Engineering", "English Literature", "Environmental Science",
  "Finance", "Graphic Design", "History", "Journalism", "Marketing",
  "Mathematics", "Mechanical Engineering", "Music", "Nursing", "Philosophy",
  "Physics", "Political Science", "Psychology", "Sociology", "Theater"
];

const COMMON_INTERESTS = [
  "Anime", "Art", "Baking", "Coffee", "Cooking", "Dancing", "Fashion",
  "Fitness", "Gaming", "Hiking", "Movies", "Music", "Photography",
  "Reading", "Sports", "Tech", "Traveling", "Writing"
];

const GENDERS = ["male", "female"]; 
const ORIENTATIONS = ["Straight", "Gay", "Bi"];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing users
    //await User.deleteMany({});
    //console.log("Cleared existing users.");

    const users = [];

    for (let i = 0; i < 20; i++) {
      const gender = faker.helpers.arrayElement(GENDERS);
      const firstName = faker.person.firstName(gender === "male" ? "male" : "female");
      const lastName = faker.person.lastName();

      users.push({
        username: faker.internet.username({ firstName, lastName }).toLowerCase(),
        password: "hashed_password_here",
        Email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        isVerified: true,
        FirstName: firstName,
        LastName: lastName,
        Age: faker.number.int({ min: 18, max: 28 }),
        Major: faker.helpers.arrayElement(MAJORS),
        Bio: `Hi, I'm ${firstName}! I love ${faker.helpers.arrayElement(COMMON_INTERESTS).toLowerCase()} and studying ${faker.helpers.arrayElement(MAJORS)}.`,
        Gender: gender,
        SexualOrientation: faker.helpers.arrayElement(ORIENTATIONS),
        ProfilePicture: "", 
        InterestedIn: gender === "male" ? ["female"] : ["male"], 
        MinDatingAge: 18,
        MaxDatingAge: 30,
        Interests: faker.helpers.arrayElements(COMMON_INTERESTS, { min: 3, max: 6 }),
        Matches: [],
        LikedUsers: [],
        DislikedUsers: []
      });
    }

    await User.insertMany(users);
    console.log("Successfully seeded 20 users matching frontend schema!");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedUsers();