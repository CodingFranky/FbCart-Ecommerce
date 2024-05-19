import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: Buffer, required: true },
  role: { type: String, required: true, default:'user' },
  addresses: { type: [mongoose.Schema.Types.Mixed] }, 
  // for addresses, we can make a separate Schema like orders. but in this case we are fine
  name: { type: String },
  salt: Buffer,
},{timestamps: true});

const virtual = userSchema.virtual('id');
virtual.get(function () {
  return this._id;
});
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const userModel = mongoose.model('User', userSchema);
export default userModel;
