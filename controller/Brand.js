import brandModel from "../model/Brand.js"


export async function fetchBrands(req, res) {
  try {
    const brands = await brandModel.find({})
    res.status(200).json(brands);
  } catch (err) {
    res.status(400).json(err);
  }
};

export async function createBrand(req, res) {
  const brand = new brandModel(req.body);
  try {
    const doc = await brand.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};
