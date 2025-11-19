import mongoose from "mongoose";

const connectDB = async () => {
    const finalURI = `${process.env.MONGODB_URI}/${process.env.MONGODB_DB}`;

    try {
        mongoose.connection.on("connected", () =>
            console.log("Local Database Connected")
        );

        await mongoose.connect(finalURI);
    } catch (error) {
        console.log(error.message);
    }
};

export default connectDB;
