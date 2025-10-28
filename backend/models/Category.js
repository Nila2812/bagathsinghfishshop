import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name_en: {
    type: String,
    required: true
  },
  name_ta: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  description_en: String,
  description_ta: String
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);