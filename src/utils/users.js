const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim();
    room = room.trim();

    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        };
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    if (existingUser) {
        return {
            error: 'Username is in use'
        };
    }

    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    const userFound = users.find(user => user.id === id);
    if(!userFound) {
        return {
            message: 'User not found'
        };
    }
    return userFound;
};

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const usersInRoom = users.filter(user => user.room === room);
    if(usersInRoom.length === 0) {
        return {
            message: 'No users in the room'
        };
    }
    return usersInRoom;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};

