import mongoose from "mongoose";

const uri =
  "mongodb+srv://puneet801:Sunil%401970@chatappcluster.p7iowry.mongodb.net/";

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

export default mongoose.connection;
