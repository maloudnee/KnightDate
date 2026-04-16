# KnightDate

A full-stack dating and social discovery platform designed specifically for the students  
and faculty of the University of Central Florida. The app was built on the MERN stack and Flutter.

## Core Pages 
- Login: Users are able to log into their accounts
- Signup: Users are able to create an account 
- Discovery: A discovery engine where users are able to browse for potential matches, featuring cards that display major, age, bio, and name, allowing for a quick "Like" or "Dislike" interaction
- Messaging: Real-time messaging where users can interact with their matches to set meetings or get to know each other better
- Profile: A personalized dashboard where users can manage their profile, uploading a new profile picture from their gallery, and view how they may appear to other users

... (add rest later)

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
   interests "": ["string"]

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
       }, ...

    }
}
```



