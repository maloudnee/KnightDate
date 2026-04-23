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

// Exact file mappings
const MALE_FILES = ["user1.png", "user2.png", "user3.png", "user4.png"];
const FEMALE_FILES = ["user11.png", "user12.png", "user13.png", "user14.png"];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const users = [];

    // Helper to generate a user object
    const createUser = (gender, fileName) => {
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();
      const major = faker.helpers.arrayElement(MAJORS);

      return {
        username: faker.internet.username({ firstName, lastName }).toLowerCase(),
        password: "hashed_password_here",
        Email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        isVerified: true,
        FirstName: firstName,
        LastName: lastName,
        Age: faker.number.int({ min: 18, max: 25 }),
        Major: major,
        Bio: `Hi, I'm ${firstName}! I love ${faker.helpers.arrayElement(COMMON_INTERESTS).toLowerCase()} and studying ${major}.`,
        Gender: gender,
        SexualOrientation: "Straight", 
        ProfilePicture: `/seed_user_profiles/${fileName}`,
        InterestedIn: gender === "male" ? ["female"] : ["male"],
        MinDatingAge: 18,
        MaxDatingAge: 30,
        Interests: faker.helpers.arrayElements(COMMON_INTERESTS, { min: 3, max: 6 }),
        Matches: [],
        LikedUsers: [],
        DislikedUsers: []
      };
    };

    // Generate 8 Men
    MALE_FILES.forEach(file => {
      users.push(createUser("male", file));
    });

    MALE_FILES.forEach(file => {
      users.push(createUser("male", file));
    });

    // Generate 8 Women
    FEMALE_FILES.forEach(file => {
      users.push(createUser("female", file));
    });

    // Generate 8 Women
    FEMALE_FILES.forEach(file => {
      users.push(createUser("female", file));
    });
    
    await User.insertMany(users);
    console.log("Successfully seeded 8 users (4 male, 4 female) with unique profile pictures!");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedUsers();