import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // connects to the User model
        required: true,
    },
    name: { type: String, required: true }, // reviewer's name (fetched from user)
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const variantSchema = new mongoose.Schema({
    color: { type: String },
    size: { type: String },
    sku: { type: String }, // stock keeping unit (unique product variation code)
    price: { type: Number },
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true, // for SEO-friendly URLs
            lowercase: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
            required: true,
        },
        images: [
            {
                type: String, // Cloudinary image URLs
                required: true,
            },
        ],
        stock: {
            type: Number,
            default: 0,
        },
        variants: [variantSchema], // array of color/size options
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviews: [reviewSchema],
        numOfReviews: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false, // to show special products on homepage
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // who added the product (admin/vendor)
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
