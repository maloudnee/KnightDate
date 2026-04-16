# KnightDate

A full-stack dating and social discovery platform designed specifically for the students  
and faculty of the University of Central Florida. The app was built on the MERN stack and Flutter.

## Core Pages 
- Login: Users are able to log into their accounts
- Signup: Users are able to create an account 
- Discovery: A discovery engine where users are able to browse for potential matches, featuring cards that display major, age, bio, and name, allowing for a quick "Like" or "Dislike" interaction
- Messaging: Real-time messaging where users can interact with their matches to set meetings or get to know each other better
- Profile: A personalized dashboard where users can manage their profile, uploading a new profile picture from their gallery, and view how they may appear to other users

## Technologies Used
- MongoDB
- Express
- React
- Node.js
- Flutter
- DigitalOcean

## Setup Instructions 
1. Clone this repo.
2. Navigate to `/server` and run `npm install`.
3. Navigate to `/frontend` and run `npm install`.
4. To run locally use `npm start` for the server and if you want to test mobile use `flutter run`.

The application is hosted and accessible @ [knightdate.xyz)(https://knightdate.xyz/)

## Contributors 
- Maloudnee Marcier 
- Lazaro Alfonso
- Jerry Xie
- Orion Brown
- Kyle Martin

## Database Structure
The application utilizes **MongoDB Atlas** for data persistence. We use a non-relational document structure to manage student profiles and real-time interactions.

### Table: Users
| Field | Type | Constraints |
| :--- | :--- | :--- |
| _id | ObjectId | NOT NULL, PRIMARY KEY |
| FirstName | String | NOT NULL |
| LastName | String | NOT NULL |
| Email | String | NOT NULL, UNIQUE |
| Username | String | NOT NULL, UNIQUE |
| Password | String | NOT NULL (Hashed) |
| Major | String | NOT NULL |
| Age | Int32 | NOT NULL |
| Bio | String | DEFAULT: "" |
| ProfilePicture | String | DEFAULT: "/default.png" |
| LikedUsers | Array | Array of User ObjectIDs |
| DislikedUsers | Array | Array of User ObjectIDs |
| Matches | Array | Array of User ObjectIDs |

### Table: Messages
| Field | Type | Constraints |
| :--- | :--- | :--- |
| _id | ObjectId | NOT NULL, PRIMARY KEY |
| sender | ObjectID | NOT NULL (Reference to Users) |
| receiver | ObjectID | NOT NULL (Reference to Users) |
| content | String | NOT NULL |
| timestamp | Date | DEFAULT: Date.now |


### `api/profile/register-profile`

**Request JSON**
```json
{
  "firstName": "string",
   "lastName": "string",
   "email": "string",
   "age": , "int"
   "major": "string",
   "bio": "string",
   "sexualOrientation": "string",
   "gender ": "string",
}
```
**Response JSON**
```json
{
   "message": "string" 
}
```

### `api/profile/update-preferences`

**Request JSON**
```json
{
   "minAge": "int",
   "maxAge": "int",
   "interestedIn": ["string"],
   "interests": ["string"]

}
```
**Response JSON**
```json
{
   "msg": "string" 
}
```

### `api/profile/:username`

**Request JSON**
```json
{
}
```
**Response JSON**
```json
{
}
```

### `api/profile/upload-picture`

**Request JSON**
```json
{
   "username": "string"
}
```
**Response JSON**
```json
{
   "message": "string",
   "path": "string"

}
```

### `auth/register`

**Request JSON**
```json
{
  "username": "string",
   "password": "string",
   "email ": "string"

}
```
**Response JSON**
```json
{
   "msg": "string",
}
```

### `auth/login`

**Request JSON**
```json
{
  "username": "string",
   "password": "string"
}
```
**Response JSON**
```json
{
   "token": "string",
   "user": {
      "_id": "int",
      "username": "string"
   }
}
```

### `api/match/like-user`

**Request JSON**
```json
{
   "targetID": "string"
}
```
**Response JSON**
```json
{
   "msg": "string",
}
```

### `api/match/dislike-user`

**Request JSON**
```json
{
   "targetID": "string"
}
```
**Response JSON**
```json
{
   "msg": "string",
}
```

### `api/match/match-users`

**Request JSON**
```json
{
   "targetID": "string"
}
```
**Response JSON**
```json
{
   "msg": "string",
}
```

### `api/match/discover`

**Request JSON**
```json
{
}
```
**Response JSON**
```json
{
   "scoredMatches": {
       {
         "_id": "string",
         "username": "string",
         "FirstName": "string",
         "LastName": "string",
         "Age": "int",
         "Major": "string",
         "Bio": "string",
         "Gender": "string",
         "ProfilePicture": "string",
         "Interests": ["string"],
         "score": "int"
       }
    }
}
```



