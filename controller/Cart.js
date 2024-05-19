import cartModel from "../model/Cart.js"


export async function fetchCartByUser(req, res) {
  const { id } = req.user;
  try {
    const cartItems = await cartModel.find({ user: id }).populate('product');

    res.status(200).json(cartItems);
  } catch (err) {
    res.status(400).json(err);
  }
};

export async function addToCart(req, res) {
  const {id} = req.user;
  const cart = new cartModel({...req.body,user:id});
  try {
    const doc = await cart.save();
    const result = await doc.populate('product');
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};

export async function deleteFromCart(req, res) {
    const { id } = req.params;
    try {
    const doc = await cartModel.findByIdAndDelete(id);
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

export async function updateCart(req, res) {
  const { id } = req.params;
  try {
    const cart = await cartModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    const result = await cart.populate('product');

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};
