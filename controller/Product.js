import productModel from "../model/Product.js"


export async function createProduct(req, res) {
  // this product we have to get from API body
  const product = new productModel(req.body);
  product.discountPrice = Math.round(product.price*(1-product.discountPercentage/100))
  try {
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (err) {
    console.log(err)
    res.status(400).json(err);
  }
};

export async function fetchAllProducts(req, res) {
  // filter = {"category":["smartphone","laptops"]}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  let condition = {}
  if(!req.query.admin){
      condition.deleted = {$ne:true}
  }
  
  let query = productModel.find(condition);
  let totalProductsQuery = productModel.find(condition);


  if (req.query.category) {
    query = query.find({ category: {$in:req.query.category.split(',')} });
    totalProductsQuery = totalProductsQuery.find({
      category: {$in:req.query.category.split(',')},
    });
  }
  if (req.query.brand) {
    query = query.find({ brand: {$in:req.query.brand.split(',')} });
    totalProductsQuery = totalProductsQuery.find({ brand: {$in:req.query.brand.split(',') }});
  }
  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }

  const totalDocs = await totalProductsQuery.count().exec();

  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    const docs = await query.exec();
    res.set('X-Total-Count', totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
  }
};

export async function fetchProductById(req, res) {

  const { id } = req.params;

  try {
    const product = await productModel.findById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};

export async function updateProduct(req, res) {

  const { id } = req.params;
  try {
    const product = await productModel.findByIdAndUpdate(id, req.body, {new:true});
    product.discountPrice = Math.round(product.price*(1-product.discountPercentage/100))
    const updatedProduct = await product.save()
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
};


