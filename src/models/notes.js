const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        authorName: { type: String, required: true },
        comments: [{ type: Object, required: true }],
        description: { type: String, required: false },
        download: { type: Number, required: true },
        email: { type: String, required: true },
        image: { type: String, required: true },
        modId: { type: String, required: true },
        price: { type: Number, required: false },
        profName: { type: String, required: true },
        url: { type: String, required: false },
        year: { type: String, required: true },
        rating: { type: Number, required: true }
    },
    { timestamps: true }
);

noteSchema.index({ authorId: 1 });
noteSchema.index({ modId: 1 });
noteSchema.index({ profId: 1 });

const notesModel = mongoose.model('notes', noteSchema);
module.exports = notesModel;
