app.post('/api/register', async (req, res) => {

    // info from frontend
    const { firstName, lastName, email, age, major, bio } = req.body;

    // new user object
    const newUser = {
        FirstName: firstName, 
        LastName: lastName, 
        Email: email,
        Age: age, 
        Major: major, 
        Bio: bio,
        Matches: [],
        LikedUsers: []
    };

    // add new user to database
    const db = client.db('KnightDateDB');
    await db.collection('Users').insertOne(newUser);

    // status message
    res.status(200).json({ message: 'User successfully registered.'})
})