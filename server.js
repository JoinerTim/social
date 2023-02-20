const app = require("./app");
const dotenv = require("dotenv")
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");
const PORT = process.env.PORT || 4000;

const http = require("http").createServer(app);

connectDatabase();

dotenv.config({path:__dirname+'/config.env'})

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============= socket.io ==============

const io = require("socket.io")(http, {
  cors: true,
  origins: ["http://locahost:4000"],
});

const server = http.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on port:${process.env.PORT}`);
});

let users = [];
let usersCall = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};



io.on("connection", (socket) => {
  // console.log("🚀 Someone connected!");
  // console.log(users);

  // get userId and socketId from client
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  

  // get and send message
  socket.on("sendMessage", async ({ senderId, receiverId, content, type }) => {

    let defaultType = "text";
    var urlImagesMessages = [];

    if (type === "image") {
      const contents = content;
      for (var i = 0; i < contents.length; i++) {
        let myCloud = await cloudinary.v2.uploader.upload(content[i], {
          folder: "messages",
          width: 150,
          crop: "scale",
          quality: 100,
        });

        urlImagesMessages.push(myCloud.secure_url);
      }
    }


    const user = getUser(receiverId);

    io.to(user?.socketId).emit("getMessage", {
      senderId,
      content:
      type === "text"
        ? content
        : urlImagesMessages.length === 1
        ? urlImagesMessages[0]
        : urlImagesMessages.join(" * "),
      type: type ? type : defaultType
    });
  });

  // typing states
  socket.on("typing", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    console.log(user);
    io.to(user?.socketId).emit("typing", senderId);
  });

  socket.on("typing stop", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("typing stop", senderId);
  });

  socket.on("join", (id) => {
		const user = { userId: socket.id, room: id };
		const check = usersCall.every((user) => user.userId !== socket.id);
		if (check) {
			usersCall.push(user);
			socket.join(user.room);
		  } else {
			usersCall.map((user) => {
			  if (user.userId === socket.id) {
				if (user.userId !== id) {
				  socket.leave(user.room);
				  socket.join(id);
				  user.userId = id;
				}
			  }
			});
		}
	})

	socket.emit("usersCall", usersCall)

  socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})
  
  socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})


  // user disconnected
  socket.on("disconnect", () => {
    console.log("⚠️ Someone disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
		socket.broadcast.emit("callEnded")
    // console.log(users);
  });
});


process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});