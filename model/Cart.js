import mongoose from "mongoose"

const cartSchema = new mongoose.Schema({
    quantity: { type : Number, required: true},
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    size: { type : mongoose.Schema.Types.Mixed, default:'none' },
    color: { type : mongoose.Schema.Types.Mixed,default:'none' },
})

const virtual  = cartSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
cartSchema.set('toJSON',{
    virtuals: true,
    versionKey: false,
    transform: function (doc,ret) { delete ret._id}
})

const cartModel = mongoose.model('Cart', cartSchema);
export default cartModel;