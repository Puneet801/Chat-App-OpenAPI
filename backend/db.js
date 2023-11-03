import mongoose from "mongoose";

// Define your MongoDB connection URI
const uri =
  "mongodb+srv://puneet801:Sunil%401970@chatappcluster.p7iowry.mongodb.net/";

// Connect to MongoDB using Mongoose
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB using Mongoose");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Export the Mongoose connection
export default mongoose.connection;
